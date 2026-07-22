import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SystemRole } from '@campusos/shared';

/**
 * Seeds a sample Organization + 2 Branches + Demo Courses + Teacher/Student/Parent Users.
 * GAP-DB-02: SRS §20.3, SDD §24.3
 */
export async function seedDemoTenant(dataSource: DataSource): Promise<void> {
  // 1. Create Organization
  const orgResult = await dataSource.query(
    `
    INSERT INTO organizations (id, name, slug, status, billing_plan, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Apex Academy', 'apex-academy', 'active', 'pro', NOW(), NOW())
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id
    `,
  );
  const orgId = orgResult[0]?.id;
  if (!orgId) return;

  // 2. Create Branches
  const b1Result = await dataSource.query(
    `
    INSERT INTO branches (id, organization_id, name, code, status, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, 'Main Campus', 'MAIN', 'active', NOW(), NOW())
    ON CONFLICT DO NOTHING RETURNING id
    `,
    [orgId],
  );
  const b1Id = b1Result[0]?.id;

  // 3. Helper to create tenant users
  const passwordHash = await bcrypt.hash('DemoPass123!', 12);
  const createUser = async (email: string, firstName: string, lastName: string, roleName: SystemRole) => {
    const uRes = await dataSource.query(
      `
      INSERT INTO users (id, email, first_name, last_name, status, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, 'active', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW() RETURNING id
      `,
      [email, firstName, lastName],
    );
    const uid = uRes[0]?.id;
    if (!uid) return null;

    await dataSource.query(
      `
      INSERT INTO auth_credentials (id, user_id, password_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
      ON CONFLICT (user_id) DO NOTHING
      `,
      [uid, passwordHash],
    );

    const mRes = await dataSource.query(
      `
      INSERT INTO memberships (id, user_id, organization_id, branch_id, status, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, 'active', NOW(), NOW())
      ON CONFLICT DO NOTHING RETURNING id
      `,
      [uid, orgId, b1Id || null],
    );
    const mid = mRes[0]?.id;

    const rRes = await dataSource.query(`SELECT id FROM roles WHERE name = $1`, [roleName]);
    const rid = rRes[0]?.id;
    if (mid && rid) {
      await dataSource.query(
        `INSERT INTO membership_roles (membership_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [mid, rid],
      );
    }
    return uid;
  };

  await createUser('orgadmin@apex.edu', 'Org', 'Admin', SystemRole.ORG_ADMIN);
  await createUser('teacher@apex.edu', 'Sarah', 'Teacher', SystemRole.TEACHER);
  const studentId = await createUser('student@apex.edu', 'Alex', 'Student', SystemRole.STUDENT);
  const parentId = await createUser('parent@apex.edu', 'Maria', 'Parent', SystemRole.PARENT);

  // Link parent to student
  if (parentId && studentId) {
    await dataSource.query(
      `
      INSERT INTO parent_links (id, parent_id, student_id, relationship, created_at)
      VALUES (gen_random_uuid(), $1, $2, 'mother', NOW())
      ON CONFLICT DO NOTHING
      `,
      [parentId, studentId],
    ).catch(() => null);
  }

  // 4. Create Demo Course
  await dataSource.query(
    `
    INSERT INTO courses (id, organization_id, branch_id, title, description, status, format, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, 'Introduction to Computer Science', 'Foundational CS principles, algorithms, and web applications.', 'published', 'topic_based', NOW(), NOW())
    ON CONFLICT DO NOTHING
    `,
    [orgId, b1Id || null],
  );

  console.log(`  🏫 Demo Tenant seeded: Apex Academy (orgId: ${orgId})`);
  console.log(`     Org Admin: orgadmin@apex.edu (DemoPass123!)`);
  console.log(`     Teacher:   teacher@apex.edu (DemoPass123!)`);
  console.log(`     Student:   student@apex.edu (DemoPass123!)`);
}
