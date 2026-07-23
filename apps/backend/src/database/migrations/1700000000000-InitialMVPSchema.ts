import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMVPSchema1700000000000 implements MigrationInterface {
  name = 'InitialMVPSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 1. ORGANIZATIONS & BRANCHES
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "slug" varchar(100) UNIQUE NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "billing_plan" varchar(50) DEFAULT 'enterprise',
        "white_label_config" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "branches" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "code" varchar(50),
        "address" text,
        "phone" varchar(50),
        "timezone" varchar(50) DEFAULT 'UTC',
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // 2. USERS, AUTH CREDENTIALS & MEMBERSHIPS
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) UNIQUE,
        "phone" varchar(50),
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "avatar_url" text,
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "locale" varchar(10) DEFAULT 'en',
        "timezone" varchar(50) DEFAULT 'UTC',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "auth_credentials" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "password_hash" varchar(255),
        "mfa_secret" varchar(255),
        "mfa_enabled" boolean DEFAULT false,
        "password_reset_token" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "memberships" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "branch_id" uuid REFERENCES "branches"("id") ON DELETE SET NULL,
        "role" varchar(50) NOT NULL,
        "roles" text[] DEFAULT '{}',
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "joined_at" timestamptz NOT NULL DEFAULT now(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "parent_links" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "parent_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "relationship" varchar(50) DEFAULT 'parent',
        "is_primary_contact" boolean DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // 3. LMS (COURSES, MODULES, LESSONS, HOMEWORK)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "branch_id" uuid REFERENCES "branches"("id") ON DELETE SET NULL,
        "code" varchar(50) NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_modules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "title" varchar(255) NOT NULL,
        "order_index" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lessons" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "module_id" uuid NOT NULL REFERENCES "course_modules"("id") ON DELETE CASCADE,
        "title" varchar(255) NOT NULL,
        "content" text,
        "order_index" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // 4. ATTENDANCE & MESSAGING
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attendance_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "course_id" uuid REFERENCES "courses"("id") ON DELETE CASCADE,
        "date" date NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'present',
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // INDEXES
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_memberships_user_org" ON "memberships"("user_id", "organization_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_courses_org" ON "courses"("organization_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_attendance_student_date" ON "attendance_records"("student_id", "date");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance_records";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lessons";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_modules";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "courses";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "parent_links";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "memberships";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_credentials";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "branches";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organizations";`);
  }
}
