import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SystemRole } from '@campusos/shared';

/**
 * Seeds initial platform_super_admin user.
 * GAP-DB-02: SRS §20.3, SDD §24.3
 */
export async function seedSuperAdmin(dataSource: DataSource): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@campusos.internal';
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdminSecret123!';

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  // 1. Check or Insert User
  let userId: string;
  const existingUser = await dataSource.query(`SELECT id FROM users WHERE email = $1`, [email]);
  if (existingUser.length > 0) {
    userId = existingUser[0].id;
    await dataSource.query(`UPDATE users SET updated_at = NOW() WHERE id = $1`, [userId]);
  } else {
    const userResult = await dataSource.query(
      `
      INSERT INTO users (id, email, first_name, last_name, status, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, 'Platform', 'Super Admin', 'active', NOW(), NOW())
      RETURNING id
      `,
      [email],
    );
    userId = userResult[0]?.id;
  }

  if (!userId) return;

  // 2. Check or Insert AuthCredential
  const existingAuth = await dataSource.query(`SELECT id FROM auth_credentials WHERE user_id = $1`, [userId]);
  if (existingAuth.length > 0) {
    await dataSource.query(
      `UPDATE auth_credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`,
      [passwordHash, userId],
    );
  } else {
    await dataSource.query(
      `
      INSERT INTO auth_credentials (id, user_id, password_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
      `,
      [userId, passwordHash],
    );
  }

  // 3. System Organization for Super Admin
  let orgId: string;
  const sysOrg = await dataSource.query(`SELECT id FROM organizations WHERE slug = $1`, ['system-root']);
  if (sysOrg.length > 0) {
    orgId = sysOrg[0].id;
  } else {
    const orgRes = await dataSource.query(
      `
      INSERT INTO organizations (id, name, slug, status, billing_plan, created_at, updated_at)
      VALUES (gen_random_uuid(), 'System Root Organization', 'system-root', 'active', 'enterprise', NOW(), NOW())
      RETURNING id
      `,
    );
    orgId = orgRes[0]?.id;
  }

  // 4. Link user to platform_admin role via membership
  const roleResult = await dataSource.query(`SELECT id FROM roles WHERE name = $1`, [SystemRole.PLATFORM_ADMIN]);
  const roleId = roleResult[0]?.id;

  if (roleId && orgId) {
    let memId: string;
    const existingMem = await dataSource.query(
      `SELECT id FROM memberships WHERE user_id = $1 AND organization_id = $2`,
      [userId, orgId]
    );
    if (existingMem.length > 0) {
      memId = existingMem[0].id;
    } else {
      const memResult = await dataSource.query(
        `
        INSERT INTO memberships (id, user_id, organization_id, status, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, 'active', NOW(), NOW())
        RETURNING id
        `,
        [userId, orgId],
      );
      memId = memResult[0]?.id;
    }

    if (memId) {
      const existingMemRole = await dataSource.query(
        `SELECT membership_id FROM membership_roles WHERE membership_id = $1 AND role_id = $2`,
        [memId, roleId]
      );
      if (existingMemRole.length === 0) {
        await dataSource.query(
          `INSERT INTO membership_roles (membership_id, role_id) VALUES ($1, $2)`,
          [memId, roleId],
        );
      }
    }
  }

  console.log(`  🔑 Super Admin user seeded: ${email}`);
}
