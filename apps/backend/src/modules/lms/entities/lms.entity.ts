import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * Subject — broad academic discipline.
 * SDD §3.2.6 LMS Context — Course Hierarchy.
 */
@Entity('subjects')
export class Subject extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'icon_url', type: 'text', nullable: true })
  iconUrl: string | null;
}

/**
 * Course — the central learning entity.
 * SDD §3.2.6 and §7.5 courses table.
 */
@Entity('courses')
@Index(['organizationId', 'branchId'])
@Index(['status'])
export class Course extends BaseEntity {
  @Column({ name: 'subject_id', type: 'uuid', nullable: true })
  subjectId: string | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, default: 'topic_based' })
  format: 'topic_based' | 'week_based' | 'semester_based' | 'self_paced' | 'instructor_led';

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({ name: 'estimated_duration_hours', type: 'decimal', precision: 5, scale: 1, nullable: true })
  estimatedDurationHours: number | null;

  @Column({ name: 'difficulty_level', type: 'varchar', length: 20, nullable: true })
  difficultyLevel: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;

  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' })
  customFields: Record<string, any>;
}

/**
 * Module — thematic grouping within a course.
 * Supports nesting via parent_module_id.
 * SDD §3.2.6.
 */
@Entity('modules')
@Index(['courseId', 'position'])
export class CourseModule extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'parent_module_id', type: 'uuid', nullable: true })
  parentModuleId: string | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'archived';
}

/**
 * Lesson — single teaching session or content unit.
 * SDD §3.2.6.
 */
@Entity('lessons')
@Index(['moduleId', 'position'])
export class Lesson extends BaseEntity {
  @Column({ name: 'module_id', type: 'uuid' })
  moduleId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  position: number;

  @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
  estimatedDurationMinutes: number | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'archived';
}

/**
 * Content Block — atomic content element within a lesson.
 * Stores type-specific data in JSONB.
 * SDD §3.2.6 and §7.5 content_blocks table.
 */
@Entity('content_blocks')
@Index(['lessonId', 'position'])
export class ContentBlock extends BaseEntity {
  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // ContentBlockType enum values

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ type: 'int' })
  position: number;

  @Column({ name: 'reusable_block_id', type: 'uuid', nullable: true })
  reusableBlockId: string | null;
}

/**
 * Homework — assignment linked to a course/lesson/module.
 * SDD §3.2.6 and §7.5 homework table.
 */
@Entity('homework')
export class Homework extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lessonId: string | null;

  @Column({ name: 'module_id', type: 'uuid', nullable: true })
  moduleId: string | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'late_policy', type: 'varchar', length: 20, default: 'accept' })
  latePolicy: 'accept' | 'deduct' | 'reject';

  @Column({ name: 'late_deduction_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  lateDeductionPercent: number | null;

  @Column({ name: 'max_attempts', type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ name: 'rubric_id', type: 'uuid', nullable: true })
  rubricId: string | null;

  @Column({ name: 'peer_review_enabled', type: 'boolean', default: false })
  peerReviewEnabled: boolean;
}

/**
 * Homework Submission — student's submitted work.
 * SDD §3.2.6 and §7.5 homework_submissions table.
 */
@Entity('homework_submissions')
@Index(['homeworkId', 'studentId'])
export class HomeworkSubmission extends BaseEntity {
  @Column({ name: 'homework_id', type: 'uuid' })
  homeworkId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  attachments: any[];

  @Column({ name: 'attempt_number', type: 'int', default: 1 })
  attemptNumber: number;

  @Column({ type: 'varchar', length: 20, default: 'submitted' })
  status: 'draft' | 'submitted' | 'graded' | 'returned' | 'resubmitted';

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'is_late', type: 'boolean', default: false })
  isLate: boolean;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy: string | null;
}

/**
 * Course Enrollment — links a user to a course.
 * SDD §3.2.6.
 */
@Entity('course_enrollments')
@Index(['userId', 'courseId'], { unique: true })
export class CourseEnrollment extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'completed' | 'dropped' | 'suspended';

  @Column({ name: 'enrolled_at', type: 'timestamptz', default: () => 'NOW()' })
  enrolledAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}

/**
 * Completion Record — tracks completion at lesson, module, and course levels.
 * SDD §3.2.6 and §7.5.
 */
@Entity('completion_records')
@Index(['userId', 'entityType', 'entityId'], { unique: true })
export class CompletionRecord extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 20 })
  entityType: 'lesson' | 'module' | 'course';

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'completed_at', type: 'timestamptz', default: () => 'NOW()' })
  completedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTENDED LMS HIERARCHY  (SRS §5.7.1, SDD §3.2.6)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Program — long-term learning track spanning multiple courses.
 * E.g., "Bachelor of CS", "IELTS Preparation Program".
 */
@Entity('programs')
@Index(['organizationId'])
export class Program extends BaseEntity {
  @Column({ name: 'subject_id', type: 'uuid', nullable: true })
  subjectId: string | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({ name: 'estimated_duration_months', type: 'int', nullable: true })
  estimatedDurationMonths: number | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;
}

/**
 * Level — proficiency tier within a subject or course.
 * E.g., "Beginner", "A1", "Intermediate", "Advanced".
 */
@Entity('levels')
@Index(['organizationId', 'subjectId'])
export class Level extends BaseEntity {
  @Column({ name: 'subject_id', type: 'uuid', nullable: true })
  subjectId: string | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Numeric order for sorting (e.g., 1 = Beginner, 2 = Intermediate) */
  @Column({ type: 'int', default: 0 })
  order: number;

  /** CEFR code or equivalent (A1, A2, B1, B2, C1, C2) */
  @Column({ name: 'framework_code', type: 'varchar', length: 20, nullable: true })
  frameworkCode: string | null;
}

/**
 * Curriculum — defined sequence of courses, modules, and assessments.
 * Linked to a Program or Level. Versioned via CurriculumVersion.
 */
@Entity('curricula')
@Index(['organizationId'])
export class Curriculum extends BaseEntity {
  @Column({ name: 'program_id', type: 'uuid', nullable: true })
  programId: string | null;

  @Column({ name: 'level_id', type: 'uuid', nullable: true })
  levelId: string | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'current_version', type: 'int', default: 1 })
  currentVersion: number;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'archived';
}

/**
 * CurriculumVersion — immutable version snapshot.
 * SRS §6.14 — existing enrollments stay on old version until migrated.
 */
@Entity('curriculum_versions')
@Index(['curriculumId', 'version'])
export class CurriculumVersion extends BaseEntity {
  @Column({ name: 'curriculum_id', type: 'uuid' })
  curriculumId: string;

  @Column({ type: 'int' })
  declare version: number;

  /** Snapshot of the curriculum structure at this version */
  @Column({ type: 'jsonb' })
  snapshot: Record<string, any>;

  @Column({ name: 'change_summary', type: 'text', nullable: true })
  changeSummary: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;
}

/**
 * Section — subdivision within a module for granular organization.
 * SRS §5.7.1: Module → Section → Lesson.
 */
@Entity('sections')
@Index(['moduleId', 'position'])
export class Section extends BaseEntity {
  @Column({ name: 'module_id', type: 'uuid' })
  moduleId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  position: number;
}

/**
 * Unit — grouping of lessons or topics within a section.
 * SRS §5.7.1: Section → Unit → Topic/Lesson.
 */
@Entity('units')
@Index(['sectionId', 'position'])
export class Unit extends BaseEntity {
  @Column({ name: 'section_id', type: 'uuid' })
  sectionId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  position: number;
}

/**
 * Topic — the most granular content element, representing a specific concept or skill.
 * SRS §5.7.1.
 */
@Entity('topics')
@Index(['lessonId', 'position'])
export class Topic extends BaseEntity {
  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @Column({ name: 'unit_id', type: 'uuid', nullable: true })
  unitId: string | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  position: number;

  @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
  estimatedDurationMinutes: number | null;

  /** Mapped learning outcomes for this topic */
  @Column({ name: 'learning_outcomes', type: 'text', array: true, nullable: true })
  learningOutcomes: string[] | null;
}

/**
 * CourseTemplate — reusable course structure template.
 * SRS §5.7.4 — organizations can save/apply templates.
 */
@Entity('course_templates')
@Index(['organizationId'])
export class CourseTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Full course structure snapshot stored in JSONB */
  @Column({ type: 'jsonb' })
  structure: Record<string, any>;

  /** true = available to all orgs on the platform */
  @Column({ name: 'is_platform_template', type: 'boolean', default: false })
  isPlatformTemplate: boolean;

  @Column({ type: 'int', default: 1 })
  declare version: number;
}

/**
 * Prerequisite — content unlock condition.
 * SRS §5.7.6 — controls when a lesson/quiz/module becomes available.
 */
@Entity('prerequisites')
@Index(['targetType', 'targetId'])
export class Prerequisite extends BaseEntity {
  /** The content being unlocked (lesson, module, quiz) */
  @Column({ name: 'target_type', type: 'varchar', length: 30 })
  targetType: 'lesson' | 'module' | 'quiz' | 'exam';

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  /** The condition that must be met */
  @Column({ name: 'condition_type', type: 'varchar', length: 30 })
  conditionType: 'completion' | 'min_grade' | 'time_elapsed' | 'date' | 'manual';

  /** The content that must satisfy the condition (lesson/module/quiz being required) */
  @Column({ name: 'source_type', type: 'varchar', length: 30, nullable: true })
  sourceType: string | null;

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId: string | null;

  /** Minimum grade threshold (0–100) if conditionType = 'min_grade' */
  @Column({ name: 'min_grade', type: 'decimal', precision: 5, scale: 2, nullable: true })
  minGrade: number | null;

  /** Hours to wait if conditionType = 'time_elapsed' */
  @Column({ name: 'hours_required', type: 'int', nullable: true })
  hoursRequired: number | null;

  /** Specific date unlock if conditionType = 'date' */
  @Column({ name: 'unlock_at', type: 'timestamptz', nullable: true })
  unlockAt: Date | null;
}

/**
 * ReusableBlock — a shareable content block that can be embedded in multiple lessons.
 * SRS §5.7.3 — avoids duplication of atomic content elements.
 */
@Entity('reusable_blocks')
@Index(['organizationId'])
export class ReusableBlock extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // same ContentBlockType values

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;
}

