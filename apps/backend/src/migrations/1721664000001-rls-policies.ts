import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GAP-SEC-01: PostgreSQL Row-Level Security Policies
 * SRS §20.2, SDD §24.2
 *
 * Enables RLS on every multi-tenant table (any table with organization_id).
 * Uses a session variable (app.current_organization_id) set by TenantContextSubscriber.
 * MUST run before any production data is written.
 */
export class RlsPolicies1721664000001 implements MigrationInterface {
  name = 'RlsPolicies1721664000001';

  /** Tables that carry organization_id and require tenant isolation */
  private readonly TENANT_TABLES = [
    'users',
    'memberships',
    'courses',
    'modules',
    'lessons',
    'content_blocks',
    'homework',
    'homework_submissions',
    'quiz_attempts',
    'quiz_responses',
    'gradebook_entries',
    'grade_history',
    'attendance_records',
    'attendance_corrections',
    'schedule_events',
    'messages',
    'notifications',
    'invoices',
    'payments',
    'groups',
    'group_memberships',
    'announcements',
    'threads',
    'posts',
    'roles',
    'feature_flags',
    'branches',
    'rooms',
    'rooms_bookings',
    'speech_recordings',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create app-level configuration parameter if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        BEGIN
          PERFORM current_setting('app.current_organization_id');
        EXCEPTION WHEN undefined_object THEN
          PERFORM set_config('app.current_organization_id', '', false);
        END;
      END;
      $$;
    `);

    for (const table of this.TENANT_TABLES) {
      // Skip if table does not exist (module may not be deployed yet)
      const exists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        )
      `, [table]);

      if (!exists[0]?.exists) continue;

      // Check if organization_id column exists on this table
      const hasOrgId = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'organization_id'
        )
      `, [table]);

      if (!hasOrgId[0]?.exists) continue;

      await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
      await queryRunner.query(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`);

      // Drop existing policy if re-run (idempotent)
      await queryRunner.query(`
        DROP POLICY IF EXISTS tenant_isolation ON "${table}"
      `);

      // Create RLS policy: row is visible only if organization_id matches session variable
      await queryRunner.query(`
        CREATE POLICY tenant_isolation ON "${table}"
          USING (
            organization_id = NULLIF(current_setting('app.current_organization_id', TRUE), '')::uuid
          )
      `);
    }

    // Platform-level tables (NO organization_id, accessible only via /platform/v1)
    // These are intentionally NOT tenant-isolated:
    // organizations, subscriptions, audit_logs, platform_users
    // (platform guard handles access control at API layer — SDD §3.2.3.2)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.TENANT_TABLES) {
      const exists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        )
      `, [table]);

      if (!exists[0]?.exists) continue;

      await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation ON "${table}"`);
      await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`);
    }
  }
}
