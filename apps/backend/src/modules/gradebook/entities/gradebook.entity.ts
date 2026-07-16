import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE CATEGORIES & WEIGHTS  (SRS §5.9.1, SDD §3.2.8)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Grade Category — grouping for grades with weights (e.g., Homework 40%, Exams 60%).
 * SDD §7.5 Gradebook Tables.
 */
@Entity('grade_categories')
export class GradeCategory extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number; // percentage (e.g., 40 = 40%)

  @Column({ name: 'drop_lowest', type: 'int', default: 0 })
  dropLowest: number;

  @Column({ type: 'int' })
  position: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE SCALES  (SRS §5.9.2)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GradeScale — configurable grade scale per organization/program/course.
 * SRS §5.9.2 — letter, percentage, GPA, pass/fail, custom scales.
 */
@Entity('grade_scales')
@Index(['organizationId'])
export class GradeScale extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'letter' })
  scaleType: 'letter' | 'percentage' | 'gpa' | 'pass_fail' | 'custom';

  @Column({ name: 'gpa_max', type: 'decimal', precision: 4, scale: 2, nullable: true })
  gpaMax: number | null;

  @Column({ name: 'passing_threshold', type: 'decimal', precision: 5, scale: 2, nullable: true })
  passingThreshold: number | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;
}

/**
 * GradeScaleMapping — maps numeric ranges to scale labels for a GradeScale.
 * E.g., 90–100 → A, 80–89 → B, etc.
 */
@Entity('grade_scale_mappings')
@Index(['scaleId', 'minScore'])
export class GradeScaleMapping extends BaseEntity {
  @Column({ name: 'scale_id', type: 'uuid' })
  scaleId: string;

  /** Label shown to student (e.g., "A", "A+", "Pass", "4.0") */
  @Column({ type: 'varchar', length: 20 })
  label: string;

  @Column({ name: 'min_score', type: 'decimal', precision: 5, scale: 2 })
  minScore: number;

  @Column({ name: 'max_score', type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  /** GPA equivalent for this range (if scale supports GPA) */
  @Column({ name: 'gpa_points', type: 'decimal', precision: 4, scale: 2, nullable: true })
  gpaPoints: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADEBOOK ENTRIES & AUDIT  (SRS §5.9.4, SDD §3.2.8)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gradebook Entry — record of a student's grade for an assignment/quiz.
 * SDD §7.5.
 */
@Entity('gradebook_entries')
@Index(['studentId', 'courseId'])
@Index(['assignmentType', 'assignmentId'])
export class GradebookEntry extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'assignment_type', type: 'varchar', length: 20 })
  assignmentType: 'homework' | 'quiz' | 'exam' | 'participation' | 'project';

  @Column({ name: 'assignment_id', type: 'uuid' })
  assignmentId: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  score: number | null;

  @Column({ name: 'max_score', type: 'decimal', precision: 8, scale: 2 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number | null; // specific weight override within category

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'graded' | 'approved' | 'returned';

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy: string | null;

  @Column({ name: 'graded_at', type: 'timestamptz', nullable: true })
  gradedAt: Date | null;

  @Column({ name: 'teacher_feedback', type: 'text', nullable: true })
  teacherFeedback: string | null;
}

/**
 * Grade History — immutable audit trail of every grade change.
 * SRS §5.9.4 — records old value, new value, actor, reason.
 * SRS §7 Business Rules — "All grade entries and modifications are recorded".
 *
 * FIX: Now properly extends BaseEntity (was missing soft-delete and audit fields).
 */
@Entity('grade_history')
export class GradeHistory extends BaseEntity {
  @Column({ name: 'gradebook_entry_id', type: 'uuid' })
  gradebookEntryId: string;

  @Column({ name: 'old_score', type: 'decimal', precision: 8, scale: 2, nullable: true })
  oldScore: number | null;

  @Column({ name: 'new_score', type: 'decimal', precision: 8, scale: 2, nullable: true })
  newScore: number | null;

  @Column({ name: 'old_status', type: 'varchar', length: 20, nullable: true })
  oldStatus: string | null;

  @Column({ name: 'new_status', type: 'varchar', length: 20, nullable: true })
  newStatus: string | null;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;
}

/**
 * GradeApproval — workflow for admin/dept head approval before grade publication.
 * SRS §5.9.4 — "Optionally require admin or department head approval."
 */
@Entity('grade_approvals')
@Index(['gradebookEntryId'])
@Index(['approverId', 'status'])
export class GradeApproval extends BaseEntity {
  @Column({ name: 'gradebook_entry_id', type: 'uuid' })
  gradebookEntryId: string;

  @Column({ name: 'submitted_by', type: 'uuid' })
  submittedBy: string;

  @Column({ name: 'approver_id', type: 'uuid', nullable: true })
  approverId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ name: 'reviewer_notes', type: 'text', nullable: true })
  reviewerNotes: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT CARDS & TRANSCRIPTS  (SRS §5.9.5)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ReportCard — generated branded report card per student per term.
 * SRS §5.9.5 — "Generate branded, printable report cards per student per term."
 */
@Entity('report_cards')
@Index(['studentId', 'termId'])
export class ReportCard extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'term_id', type: 'varchar', length: 100 })
  termId: string; // e.g., "2026-spring", "Q1-2026"

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  /** Summary of grades per course — JSONB snapshot */
  @Column({ name: 'grade_summary', type: 'jsonb', default: '{}' })
  gradeSummary: Record<string, any>;

  @Column({ name: 'overall_gpa', type: 'decimal', precision: 4, scale: 2, nullable: true })
  overallGpa: number | null;

  @Column({ name: 'attendance_summary', type: 'jsonb', default: '{}' })
  attendanceSummary: Record<string, any>;

  /** S3 path to the generated PDF */
  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string | null;

  @Column({ name: 'generated_at', type: 'timestamptz', nullable: true })
  generatedAt: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'archived';
}

/**
 * Transcript — cumulative academic transcript with GPA and course history.
 * SRS §5.9.5 — "Generate academic transcripts with cumulative GPA and course history."
 */
@Entity('transcripts')
@Index(['studentId', 'organizationId'])
export class Transcript extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  /** Ordered list of course records (course, grade, credits, term) */
  @Column({ name: 'course_records', type: 'jsonb', default: '[]' })
  courseRecords: Array<{
    courseId: string;
    courseTitle: string;
    grade: string;
    gradePoints: number;
    credits: number;
    term: string;
    completedAt: string;
  }>;

  @Column({ name: 'cumulative_gpa', type: 'decimal', precision: 4, scale: 2, nullable: true })
  cumulativeGpa: number | null;

  @Column({ name: 'total_credits', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalCredits: number;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string | null;

  @Column({ name: 'generated_at', type: 'timestamptz', nullable: true })
  generatedAt: Date | null;

  @Column({ name: 'is_official', type: 'boolean', default: false })
  isOfficial: boolean;
}
