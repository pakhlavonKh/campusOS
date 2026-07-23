import { DataSource } from 'typeorm';
import { Resource, Action } from '@campusos/shared';

/**
 * Seeds all resources x actions as granular permissions into DB.
 * GAP-RBAC-01: SRS §20.5, SDD §24.3
 */
export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const resources = Object.values(Resource);
  const actions = Object.values(Action);

  for (const resource of resources) {
    for (const action of actions) {
      const existing = await dataSource.query(
        `SELECT id FROM permissions WHERE resource = $1 AND action = $2`,
        [resource, action]
      );
      if (existing.length === 0) {
        await dataSource.query(
          `
          INSERT INTO permissions (id, resource, action, description, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
          `,
          [resource, action, `Permission to ${action} ${resource}`],
        );
      }
    }
  }
}
