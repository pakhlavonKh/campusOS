import { DataSource } from 'typeorm';
import { SystemRole, DEFAULT_ROLE_PERMISSIONS } from '@campusos/shared';

/**
 * Seeds SystemRoles + role_permissions mappings from DEFAULT_ROLE_PERMISSIONS.
 * GAP-RBAC-01: SRS §20.5, SDD §24.3
 */
export async function seedRoles(dataSource: DataSource): Promise<void> {
  for (const roleName of Object.values(SystemRole)) {
    // 1. Upsert role
    const result = await dataSource.query(
      `
      INSERT INTO roles (id, name, description, is_system, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, TRUE, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE SET is_system = TRUE, updated_at = NOW()
      RETURNING id
      `,
      [roleName, `System role: ${roleName}`],
    );

    const roleId = result[0]?.id;
    if (!roleId) continue;

    // 2. Assign default permissions
    const permissions = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
    for (const perm of permissions) {
      if (perm.resource === ('*' as any)) {
        // Platform admin gets all permissions
        await dataSource.query(
          `
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT $1, id FROM permissions
          ON CONFLICT DO NOTHING
          `,
          [roleId],
        );
      } else {
        await dataSource.query(
          `
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT $1, id FROM permissions WHERE resource = $2 AND action = $3
          ON CONFLICT DO NOTHING
          `,
          [roleId, perm.resource, perm.action],
        );
      }
    }
  }
}
