import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SystemRole } from '@campusos/shared';

/**
 * Seeds a sample Organization + 2 Branches + Demo Courses + Credentials for ALL Roles.
 * GAP-DB-02: SRS §20.3, SDD §24.3
 */
export async function seedDemoTenant(dataSource: DataSource): Promise<void> {
  // 1. Create Organization
  let orgId: string;
  const existingOrg = await dataSource.query(`SELECT id FROM organizations WHERE slug = $1`, ['apex-academy']);
  if (existingOrg.length > 0) {
    orgId = existingOrg[0].id;
    await dataSource.query(`UPDATE organizations SET updated_at = NOW() WHERE id = $1`, [orgId]);
  } else {
    const orgResult = await dataSource.query(
      `
      INSERT INTO organizations (id, name, slug, status, billing_plan, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Apex Academy', 'apex-academy', 'active', 'pro', NOW(), NOW())
      RETURNING id
      `,
    );
    orgId = orgResult[0]?.id;
  }
  if (!orgId) return;

  // 2. Create Branches
  let b1Id: string;
  const existingBranch = await dataSource.query(`SELECT id FROM branches WHERE organization_id = $1 AND slug = $2`, [orgId, 'main-campus']);
  if (existingBranch.length > 0) {
    b1Id = existingBranch[0].id;
  } else {
    const b1Result = await dataSource.query(
      `
      INSERT INTO branches (id, organization_id, name, slug, status, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, 'Main Campus', 'main-campus', 'active', NOW(), NOW())
      RETURNING id
      `,
      [orgId],
    );
    b1Id = b1Result[0]?.id;
  }

  // 3. Helper to create tenant users
  const passwordHash = await bcrypt.hash('DemoPass123!', 12);
  const createUser = async (email: string, firstName: string, lastName: string, roleName: SystemRole) => {
    let uid: string;
    const existingU = await dataSource.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existingU.length > 0) {
      uid = existingU[0].id;
      await dataSource.query(`UPDATE users SET updated_at = NOW() WHERE id = $1`, [uid]);
    } else {
      const uRes = await dataSource.query(
        `
        INSERT INTO users (id, email, first_name, last_name, status, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, 'active', NOW(), NOW())
        RETURNING id
        `,
        [email, firstName, lastName],
      );
      uid = uRes[0]?.id;
    }
    if (!uid) return null;

    // Auth Credential
    const existingCred = await dataSource.query(`SELECT id FROM auth_credentials WHERE user_id = $1`, [uid]);
    if (existingCred.length > 0) {
      await dataSource.query(`UPDATE auth_credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`, [passwordHash, uid]);
    } else {
      await dataSource.query(
        `
        INSERT INTO auth_credentials (id, user_id, password_hash, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
        `,
        [uid, passwordHash],
      );
    }

    // Membership
    let mid: string;
    const existingMem = await dataSource.query(
      `SELECT id FROM memberships WHERE user_id = $1 AND organization_id = $2`,
      [uid, orgId]
    );
    if (existingMem.length > 0) {
      mid = existingMem[0].id;
    } else {
      const mRes = await dataSource.query(
        `
        INSERT INTO memberships (id, user_id, organization_id, branch_id, status, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, 'active', NOW(), NOW())
        RETURNING id
        `,
        [uid, orgId, b1Id || null],
      );
      mid = mRes[0]?.id;
    }

    const rRes = await dataSource.query(`SELECT id FROM roles WHERE name = $1`, [roleName]);
    const rid = rRes[0]?.id;
    if (mid && rid) {
      const existingMemRole = await dataSource.query(
        `SELECT membership_id FROM membership_roles WHERE membership_id = $1 AND role_id = $2`,
        [mid, rid]
      );
      if (existingMemRole.length === 0) {
        await dataSource.query(
          `INSERT INTO membership_roles (membership_id, role_id) VALUES ($1, $2)`,
          [mid, rid],
        );
      }
    }
    return uid;
  };

  // Seed credentials for ALL application roles
  await createUser('orgadmin@apex.edu', 'Org', 'Admin', SystemRole.ORG_ADMIN);
  await createUser('branchadmin@apex.edu', 'Branch', 'Admin', SystemRole.BRANCH_ADMIN);
  await createUser('teacher@apex.edu', 'Sarah', 'Teacher', SystemRole.TEACHER);
  await createUser('assistant@apex.edu', 'Marcus', 'Assistant', SystemRole.ASSISTANT_TEACHER);
  const studentId = await createUser('student@apex.edu', 'Alex', 'Student', SystemRole.STUDENT);
  const parentId = await createUser('parent@apex.edu', 'David', 'Parent', SystemRole.PARENT);

  // Link parent to student
  if (parentId && studentId) {
    const existingLink = await dataSource.query(
      `SELECT id FROM parent_links WHERE parent_id = $1 AND student_id = $2`,
      [parentId, studentId]
    );
    if (existingLink.length === 0) {
      await dataSource.query(
        `
        INSERT INTO parent_links (id, parent_id, student_id, relationship, created_at)
        VALUES (gen_random_uuid(), $1, $2, 'father', NOW())
        `,
        [parentId, studentId],
      ).catch(() => null);
    }
  }

  // 4. Create Demo Course
  const existingCourse = await dataSource.query(
    `SELECT id FROM courses WHERE organization_id = $1 AND title = $2`,
    [orgId, 'Introduction to Computer Science']
  );
  if (existingCourse.length === 0) {
    await dataSource.query(
      `
      INSERT INTO courses (id, organization_id, branch_id, title, description, status, format, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, 'Introduction to Computer Science', 'Foundational CS principles, algorithms, and web applications.', 'published', 'topic_based', NOW(), NOW())
      `,
      [orgId, b1Id || null],
    );
  }

  console.log(`  🏫 Demo Tenant seeded with credentials for ALL roles: Apex Academy (orgId: ${orgId})`);
  console.log(`     Super Admin:       admin@campusos.internal (SuperAdminSecret123!)`);
  console.log(`     Org Admin:         orgadmin@apex.edu (DemoPass123!)`);
  console.log(`     Branch Admin:      branchadmin@apex.edu (DemoPass123!)`);
  console.log(`     Teacher:           teacher@apex.edu (DemoPass123!)`);
  console.log(`     Assistant Teacher: assistant@apex.edu (DemoPass123!)`);
  console.log(`     Student:           student@apex.edu (DemoPass123!)`);
  console.log(`     Parent:            parent@apex.edu (DemoPass123!)`);
}
