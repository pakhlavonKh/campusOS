-- CampusOS Database Seeding Script
-- Use this script to populate mock data into your PostgreSQL 16+ instance.

-- 1. Create Mock Organization (Tenant)
INSERT INTO organizations (
    id, name, slug, status, billing_plan, settings, white_label_config, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Stanford University',
    'stanford',
    'active',
    'premium',
    '{"timezone": "America/Los_Angeles"}',
    '{"primaryColor": "#e11d48", "secondaryColor": "#be123c"}', -- Stanford Crimson Whitelabel
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Mock Branch
INSERT INTO branches (
    id, organization_id, name, slug, address, timezone, status, settings, created_at, updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'Main Campus',
    'main-campus',
    '450 Serra Mall, Stanford, CA 94305',
    'America/Los_Angeles',
    'active',
    '{}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Mock Users
-- Password hash for 'password123' using bcrypt (generated with salt round 12)
-- $2b$12$6K.yL5KxWvY/t2T6uDuxIe69eU8Fz6a992tH2N.s3C7/ZfIoeO15G
INSERT INTO users (
    id, email, first_name, last_name, status, avatar_url, created_at, updated_at
) VALUES 
(
    '22222222-2222-2222-2222-222222222222',
    'admin@stanford.edu',
    'Sarah',
    'Admin',
    'active',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    NOW(),
    NOW()
),
(
    '33333333-3333-3333-3333-333333333333',
    'instructor@stanford.edu',
    'John',
    'Instructor',
    'active',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    NOW(),
    NOW()
),
(
    '44444444-4444-4444-4444-444444444444',
    'student@stanford.edu',
    'Alex',
    'Student',
    'active',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Create Mock User Credentials (Password)
INSERT INTO auth_credentials (
    id, user_id, password_hash, mfa_secret, mfa_enabled, created_at, updated_at
) VALUES
(
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '$2b$12$6K.yL5KxWvY/t2T6uDuxIe69eU8Fz6a992tH2N.s3C7/ZfIoeO15G',
    NULL,
    false,
    NOW(),
    NOW()
),
(
    'a3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '$2b$12$6K.yL5KxWvY/t2T6uDuxIe69eU8Fz6a992tH2N.s3C7/ZfIoeO15G',
    NULL,
    false,
    NOW(),
    NOW()
),
(
    'a4444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    '$2b$12$6K.yL5KxWvY/t2T6uDuxIe69eU8Fz6a992tH2N.s3C7/ZfIoeO15G',
    NULL,
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Create Mock Courses (LMS)
INSERT INTO courses (
    id, organization_id, branch_id, title, description, format, status, thumbnail_url, estimated_duration_hours, difficulty_level, tags, custom_fields, created_at, updated_at
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'Advanced Physics: Quantum Mechanics',
    'A rigorous introduction to quantum mechanics covering wavefunctions, Schrodinger equation, and tunneling.',
    'semester_based',
    'published',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    40.0,
    'advanced',
    ARRAY['Physics', 'Quantum', 'Science'],
    '{}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Create Course Enrollment
INSERT INTO course_enrollments (
    id, organization_id, branch_id, user_id, course_id, status, enrolled_at, created_at, updated_at
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444', -- Student
    '55555555-5555-5555-5555-555555555555', -- Physics
    'active',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 7. Create Modules
INSERT INTO modules (
    id, organization_id, branch_id, course_id, parent_module_id, title, description, position, status, created_at, updated_at
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    NULL,
    'Module 1: Wave-Particle Duality',
    'Introduction to light particles, wavefunctions, and de Broglie relation.',
    1,
    'published',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Create Lessons
INSERT INTO lessons (
    id, organization_id, branch_id, module_id, title, description, position, estimated_duration_minutes, status, created_at, updated_at
) VALUES 
(
    '88888888-8888-8888-8888-888888888888',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777777',
    'Lesson 1.1: The Photoelectric Effect',
    'Understand how photon collisions reject electrons from metal surfaces.',
    1,
    45,
    'published',
    NOW(),
    NOW()
),
(
    '88888888-8888-8888-8888-888888888889',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777777',
    'Lesson 1.2: Wave Packets & Uncertainty Principle',
    'De Broglie hypothesis and Heisenberg Uncertainty limit.',
    2,
    60,
    'published',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 9. Create Content Blocks
INSERT INTO content_blocks (
    id, organization_id, branch_id, lesson_id, type, data, position, reusable_block_id, created_at, updated_at
) VALUES (
    '99999999-9999-9999-9999-999999999999',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '88888888-8888-8888-8888-888888888888',
    'text',
    '{"content": "Quantum mechanics began when Max Planck solved blackbody radiation..."}',
    1,
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 10. Gradebook Categories
INSERT INTO gradebook_categories (
    id, organization_id, branch_id, course_id, name, weight, position, created_at, updated_at
) VALUES 
(
    'c1111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    'Homework & Assignments',
    40.0,
    1,
    NOW(),
    NOW()
),
(
    'c2222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    'Exams & Tests',
    60.0,
    2,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
