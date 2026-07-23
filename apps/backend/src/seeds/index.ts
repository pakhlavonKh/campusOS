import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Database Seeder Orchestrator
 *
 * Run with: pnpm seed
 *
 * Seeds (in order):
 *  1. Permissions
 *  2. System roles + role-permission mappings
 *  3. Platform super admin user
 *  4. Demo tenant (org, branches, demo users, demo courses)
 *
 * All seeds are idempotent (safe to re-run).
 * GAP-DB-02: SRS §20.3, SDD §24.3.2
 */

import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';
import { seedSuperAdmin } from './super-admin.seed';
import { seedDemoTenant } from './demo-tenant.seed';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || process.env.DB_PORT) || 5432,
    username: process.env.DATABASE_USER || process.env.DB_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASS || process.env.DB_PASSWORD || 'admin',
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'campusos',
    entities: [path.join(__dirname, '../**/*.entity.{ts,js}')],
    synchronize: process.env.NODE_ENV === 'development',
    logging: false,
  });

  await dataSource.initialize();
  console.log('📦 Seeder connected to database');

  try {
    console.log('\n🌱 Seeding permissions...');
    await seedPermissions(dataSource);

    console.log('🌱 Seeding roles + role-permission mappings...');
    await seedRoles(dataSource);

    console.log('🌱 Seeding platform super admin...');
    await seedSuperAdmin(dataSource);

    if (process.env.SEED_DEMO !== 'false') {
      console.log('🌱 Seeding demo tenant...');
      await seedDemoTenant(dataSource);
    }

    console.log('\n✅ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

main();
