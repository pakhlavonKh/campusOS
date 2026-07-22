import { DataSource } from 'typeorm';

export interface TestTenantInfo {
  organizationId: string;
  userToken: string;
  userId: string;
}

/**
 * Helper to create isolated test tenants for cross-tenant leak testing.
 * GAP-TEST-01: SRS §20.9, SDD §24.11
 */
export class TestTenantFactory {
  static async createTenant(dataSource: DataSource, slug: string): Promise<TestTenantInfo> {
    const orgRes = await dataSource.query(
      `INSERT INTO organizations (id, name, slug, status, billing_plan, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'active', 'pro', NOW(), NOW())
       RETURNING id`,
      [`Test Org ${slug}`, `test-org-${slug}-${Date.now()}`],
    );
    const organizationId = orgRes[0].id;

    const userRes = await dataSource.query(
      `INSERT INTO users (id, email, first_name, last_name, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'Test', 'User', 'active', NOW(), NOW())
       RETURNING id`,
      [`user-${slug}-${Date.now()}@test.org`],
    );
    const userId = userRes[0].id;

    return {
      organizationId,
      userId,
      userToken: `mock-jwt-token-org-${organizationId}`,
    };
  }
}
