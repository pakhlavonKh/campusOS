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

  // 1. Upsert User
  const userResult = await dataSource.query(
    `
    INSERT INTO users (id, email, first_name, last_name, status, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, 'Platform', 'Super Admin', 'active', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id
    `,
    [email],
  );

  const userId = userResult[0]?.id;
  if (!userId) return;

  // 2. Upsert AuthCredential
  await dataSource.query(
    `
    INSERT INTO auth_credentials (id, user_id, password_hash, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET password_hash = $2, updated_at = NOW()
    `,
    [userId, passwordHash],
  );

  // 3. Link user to platform_admin role via a system membership (organization_id NULL)
  const roleResult = await dataSource.query(`SELECT id FROM roles WHERE name = $1`, [SystemRole.PLATFORM_ADMIN]);
  const roleId = roleResult[0]?.id;

  if (roleId) {
    const memResult = await dataSource.query(
      `
      INSERT INTO memberships (id, user_id, organization_id, status, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, NULL, 'active', NOW(), NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
      `,
      [userId],
    );
    const memId = memResult[0]?.id;
    if (memId) {
      await dataSource.query(
        `INSERT INTO membership_roles (membership_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [memId, roleId],
      );
    }
  }

  console.log(`  🔑 Super Admin user seeded: ${email}`);
}
