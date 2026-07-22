/**
 * TypeORM CLI-compatible DataSource configuration.
 * GAP-DB-01: Required for migration runner in staging/production.
 * SRS §20.3, SDD §24.3
 *
 * Usage:
 *   pnpm migration:generate src/migrations/MigrationName
 *   pnpm migration:run
 *   pnpm migration:revert
 */
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'campusos',
  password: process.env.DB_PASS || 'campusos',
  database: process.env.DB_NAME || 'campusos',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [path.join(__dirname, 'src/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src/migrations/*.{ts,js}')],
  synchronize: false, // NEVER true outside NODE_ENV=development
  logging: process.env.DB_LOGGING === 'true' ? ['query', 'error'] : ['error'],
});
