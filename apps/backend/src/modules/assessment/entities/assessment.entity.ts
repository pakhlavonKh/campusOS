import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION BANK  (SRS §5.8.1, SDD §3.2.7)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * QuestionBank — tenant-scoped container for reusable questions.
 */
@Entity('question_banks')
@Index(['organizationId'])
export class QuestionBank extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_shared', type: 'boolean', default: false })
  isShared: boolean;
}

/**
 * QuestionCategory — hierarchical categorization within a question bank.
 * Self-referential: parentCategoryId allows nested categories.
 */
@Entity('question_categories')
@Index(['bankId', 'parentCategoryId'])
export class QuestionCategory extends BaseEntity {
  @Column({ name: 'bank_id', type: 'uuid' })
  bankId: string;

  @Column({ name: 'parent_category_id', type: 'uuid', nullable: true })
  parentCategoryId: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}

/**
 * Question — polymorphic question entity.
 * The content JSONB field stores all type-specific data:
 * options (MCQ), matchPairs, codeStubs, imageUrl, latexFormula, etc.
 *
 * Supported types (SRS §5.8.1):
 *  multiple_choice | multiple_select | true_false | matching | ordering |
 *  fill_in_blank | cloze | numeric | formula | short_answer | essay |
 *  code_submission | file_upload | audio_submission | spoken_response |
 *  image_annotation | drag_and_drop | matrix_grid | likert_scale
 */
@Entity('questions')
@Index(['bankId', 'categoryId'])
@Index(['organizationId', 'difficultyLevel'])
export class Question extends BaseEntity {
  @Column({ name: 'bank_id', type: 'uuid' })
  bankId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'varchar', length: 50 })
  type:
    | 'multiple_choice'
    | 'multiple_select'
    | 'true_false'
    | 'matching'
    | 'ordering'
    | 'fill_in_blank'
    | 'cloze'
    | 'numeric'
    | 'formula'
    | 'short_answer'
    | 'essay'
    | 'code_submission'
    | 'file_upload'
    | 'audio_submission'
    | 'spoken_response'
    | 'image_annotation'
    | 'drag_and_drop'
    | 'matrix_grid'
    | 'likert_scale';

  /** Rich question text (markdown + LaTeX) */
  @Column({ type: 'text' })
  stem: string;

  /** All type-specific data: options, correctAnswers, matchPairs, codeStubs, etc. */
  @Column({ type: 'jsonb' })
  content: Record<string, any>;

  /** Explanation shown after answering */
  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  /** Optional hints (array of hint texts) */
  @Column({ type: 'jsonb', default: '[]' })
  hints: string[];

  @Column({ name: 'difficulty_level', type: 'varchar', length: 20, default: 'medium' })
  difficultyLevel: 'easy' | 'medium' | 'hard';

  @Column({ name: 'default_points', type: 'decimal', precision: 6, scale: 2, default: 1 })
  defaultPoints: number;

  /** Supports partial credit grading */
  @Column({ name: 'allow_partial_credit', type: 'boolean', default: false })
  allowPartialCredit: boolean;

  /** Freeform tags for cross-category searching */
  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;

  /** Learning outcome IDs this question maps to */
  @Column({ name: 'learning_outcome_ids', type: 'uuid', array: true, nullable: true })
  learningOutcomeIds: string[] | null;

  @Column({ name: 'subject_id', type: 'uuid', nullable: true })
  subjectId: string | null;

  @Column({ name: 'current_version', type: 'int', default: 1 })
  currentVersion: number;
}

/**
 * QuestionVersion — version history per question.
 * SRS §5.8.1 — every edit creates a new version.
 */
@Entity('question_versions')
@Index(['questionId', 'revision'])
export class QuestionVersion extends BaseEntity {
  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @Column({ type: 'int' })
  revision: number;

  @Column({ type: 'jsonb' })
  snapshot: Record<string, any>;

  @Column({ name: 'change_summary', type: 'text', nullable: true })
  changeSummary: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ / ASSESSMENT  (SRS §5.8.2, SDD §3.2.7)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Quiz — a configured assessment derived from a question bank.
 * Replaces the legacy monolithic Assessment entity.
 */
@Entity('quizzes')
@Index(['courseId', 'organizationId'])
export class Quiz extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string | null;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lessonId: string | null;

  @Column({ name: 'module_id', type: 'uuid', nullable: true })
  moduleId: string | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20, default: 'quiz' })
  quizType: 'quiz' | 'exam' | 'practice' | 'survey';

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'archived';
}

/**
 * QuizConfiguration — all settings for a quiz delivery.
 * SRS §5.8.2 — time limits, availability windows, anti-cheat, attempts, etc.
 */
@Entity('quiz_configurations')
@Index(['quizId'], { unique: true })
export class QuizConfiguration extends BaseEntity {
  @Column({ name: 'quiz_id', type: 'uuid', unique: true })
  quizId: string;

  @Column({ name: 'time_limit_minutes', type: 'int', nullable: true })
  timeLimitMinutes: number | null;

  @Column({ name: 'max_attempts', type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ name: 'score_strategy', type: 'varchar', length: 20, default: 'best' })
  scoreStrategy: 'best' | 'last' | 'average';

  @Column({ name: 'available_from', type: 'timestamptz', nullable: true })
  availableFrom: Date | null;

  @Column({ name: 'available_until', type: 'timestamptz', nullable: true })
  availableUntil: Date | null;

  @Column({ name: 'shuffle_questions', type: 'boolean', default: false })
  shuffleQuestions: boolean;

  @Column({ name: 'shuffle_answers', type: 'boolean', default: false })
  shuffleAnswers: boolean;

  @Column({ name: 'show_feedback', type: 'varchar', length: 20, default: 'after_submission' })
  showFeedback: 'immediate' | 'after_submission' | 'after_deadline' | 'manual' | 'never';

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ name: 'ip_whitelist', type: 'text', array: true, nullable: true })
  ipWhitelist: string[] | null;

  @Column({ name: 'is_open_book', type: 'boolean', default: false })
  isOpenBook: boolean;

  @Column({ name: 'is_practice_mode', type: 'boolean', default: false })
  isPracticeMode: boolean;

  @Column({ name: 'is_adaptive', type: 'boolean', default: false })
  isAdaptive: boolean;

  /** Anti-cheat intensity: none, basic, standard, strict, proctored */
  @Column({ name: 'anti_cheat_level', type: 'varchar', length: 20, default: 'basic' })
  antiCheatLevel: 'none' | 'basic' | 'standard' | 'strict' | 'proctored';

  @Column({ name: 'passing_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  passingScore: number | null;

  @Column({ name: 'allow_backtracking', type: 'boolean', default: true })
  allowBacktracking: boolean;
}

/**
 * QuizQuestion — junction linking a quiz to questions with per-question overrides.
 * SRS §5.8.2 — supports weighted questions, question groups, random pools.
 */
@Entity('quiz_questions')
@Index(['quizId', 'position'])
export class QuizQuestion extends BaseEntity {
  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'question_id', type: 'uuid', nullable: true })
  questionId: string | null; // null = random pool draw

  /** Group name for organizing questions (e.g., "Section A") */
  @Column({ name: 'group_name', type: 'varchar', length: 100, nullable: true })
  groupName: string | null;

  @Column({ type: 'int' })
  position: number;

  @Column({ name: 'points_override', type: 'decimal', precision: 6, scale: 2, nullable: true })
  pointsOverride: number | null;

  /** Random pool: draw from this category instead of a specific question */
  @Column({ name: 'pool_category_id', type: 'uuid', nullable: true })
  poolCategoryId: string | null;

  @Column({ name: 'pool_draw_count', type: 'int', nullable: true })
  poolDrawCount: number | null;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired: boolean;
}

/**
 * QuizAttempt — a student's single attempt at a quiz.
 * SRS §5.8.3 — created on start, scored on submit.
 */
@Entity('quiz_attempts')
@Index(['quizId', 'studentId'])
@Index(['studentId', 'organizationId'])
export class QuizAttempt extends BaseEntity {
  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'attempt_number', type: 'int', default: 1 })
  attemptNumber: number;

  @Column({ type: 'varchar', length: 20, default: 'in_progress' })
  status: 'in_progress' | 'submitted' | 'grading' | 'graded' | 'voided';

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'NOW()' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'time_spent_seconds', type: 'int', nullable: true })
  timeSpentSeconds: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  score: number | null;

  @Column({ name: 'max_score', type: 'decimal', precision: 8, scale: 2, nullable: true })
  maxScore: number | null;

  @Column({ name: 'percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number | null;

  @Column({ name: 'is_passed', type: 'boolean', nullable: true })
  isPassed: boolean | null;

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy: string | null;

  @Column({ name: 'graded_at', type: 'timestamptz', nullable: true })
  gradedAt: Date | null;

  /** Server-side snapshot of questions shown in this attempt (for anti-randomization) */
  @Column({ name: 'question_order', type: 'uuid', array: true, nullable: true })
  questionOrder: string[] | null;
}

/**
 * QuizResponse — student's response to a single question within an attempt.
 */
@Entity('quiz_responses')
@Index(['attemptId', 'questionId'])
export class QuizResponse extends BaseEntity {
  @Column({ name: 'attempt_id', type: 'uuid' })
  attemptId: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  /** Student's answer — JSONB to support all types (string, array, object) */
  @Column({ type: 'jsonb', nullable: true })
  answer: any;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  score: number | null;

  @Column({ name: 'max_score', type: 'decimal', precision: 6, scale: 2, nullable: true })
  maxScore: number | null;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @Column({ name: 'is_auto_graded', type: 'boolean', default: false })
  isAutoGraded: boolean;

  @Column({ name: 'grader_feedback', type: 'text', nullable: true })
  graderFeedback: string | null;

  @Column({ name: 'time_spent_seconds', type: 'int', nullable: true })
  timeSpentSeconds: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADING RUBRICS  (SRS §5.8.3, §5.9.3, SDD §3.2.7, §3.2.8)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GradingRubric — reusable rubric shared across assessments and gradebook.
 * SRS §5.8.3, §5.9.3 — supports analytic and holistic rubrics.
 */
@Entity('grading_rubrics')
@Index(['organizationId'])
export class GradingRubric extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20, default: 'analytic' })
  rubricType: 'analytic' | 'holistic';

  @Column({ name: 'total_points', type: 'decimal', precision: 8, scale: 2 })
  totalPoints: number;
}

/**
 * RubricCriterion — a single row (criterion) within a rubric.
 * For analytic rubrics: each criterion is scored independently.
 * For holistic rubrics: a single criterion describes the overall score.
 */
@Entity('rubric_criteria')
@Index(['rubricId', 'position'])
export class RubricCriterion extends BaseEntity {
  @Column({ name: 'rubric_id', type: 'uuid' })
  rubricId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  position: number;

  @Column({ name: 'max_points', type: 'decimal', precision: 6, scale: 2 })
  maxPoints: number;

  /** Levels: [{label: 'Excellent', points: 4, description: '...'}, ...] */
  @Column({ type: 'jsonb', default: '[]' })
  levels: Array<{
    label: string;
    points: number;
    description: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-CHEAT  (SRS §5.8.5, SDD §3.2.7)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AntiCheatConfiguration — per-quiz anti-cheat settings.
 * SRS §5.8.5 — intensity: none, basic, standard, strict, proctored.
 */
@Entity('anti_cheat_configs')
@Index(['quizId'], { unique: true })
export class AntiCheatConfiguration extends BaseEntity {
  @Column({ name: 'quiz_id', type: 'uuid', unique: true })
  quizId: string;

  @Column({ name: 'detect_tab_switch', type: 'boolean', default: false })
  detectTabSwitch: boolean;

  @Column({ name: 'detect_window_blur', type: 'boolean', default: false })
  detectWindowBlur: boolean;

  @Column({ name: 'require_fullscreen', type: 'boolean', default: false })
  requireFullscreen: boolean;

  @Column({ name: 'detect_clipboard', type: 'boolean', default: false })
  detectClipboard: boolean;

  @Column({ name: 'disable_copy_paste', type: 'boolean', default: false })
  disableCopyPaste: boolean;

  @Column({ name: 'require_lockdown_browser', type: 'boolean', default: false })
  requireLockdownBrowser: boolean;

  @Column({ name: 'enable_webcam', type: 'boolean', default: false })
  enableWebcam: boolean;

  @Column({ name: 'enable_microphone', type: 'boolean', default: false })
  enableMicrophone: boolean;

  /** Max allowed violations before auto-submit */
  @Column({ name: 'max_violations', type: 'int', default: 5 })
  maxViolations: number;

  /** Enable statistical analysis for copied response detection */
  @Column({ name: 'statistical_analysis', type: 'boolean', default: false })
  statisticalAnalysis: boolean;
}

/**
 * AntiCheatLog — immutable violation log per attempt.
 * SRS §5.8.5 — violations cannot be retroactively removed.
 * SRS §7 Business Rules — audit logs for exam activity.
 */
@Entity('anti_cheat_logs')
@Index(['attemptId'])
@Index(['studentId', 'quizId'])
export class AntiCheatLog {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ name: 'attempt_id', type: 'uuid' })
  attemptId: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 50 })
  violationType:
    | 'tab_switch'
    | 'window_blur'
    | 'fullscreen_exit'
    | 'clipboard_copy'
    | 'clipboard_paste'
    | 'right_click'
    | 'suspicious_pattern'
    | 'webcam_absent'
    | 'auto_submitted';

  @Column({ name: 'severity', type: 'varchar', length: 20, default: 'warning' })
  severity: 'info' | 'warning' | 'critical';

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  occurredAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEGACY ENTITIES (kept for backward compat; deprecated in favour of Quiz/*)
// ═══════════════════════════════════════════════════════════════════════════════

/** @deprecated Use Quiz + QuizConfiguration instead. */
@Entity('assessments')
@Index(['courseId'])
export class Assessment extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'duration_minutes', type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ name: 'passing_score', type: 'decimal', precision: 5, scale: 2, default: 60.00 })
  passingScore: number;

  @Column({ name: 'max_attempts', type: 'int', default: 3 })
  maxAttempts: number;
}

/** @deprecated Use Question instead. */
@Entity('assessment_questions')
@Index(['assessmentId'])
export class AssessmentQuestion extends BaseEntity {
  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', length: 50, default: 'multiple_choice' })
  type: 'multiple_choice' | 'open';

  @Column({ type: 'jsonb', default: '[]' })
  options: string[];

  @Column({ name: 'correct_answer', type: 'varchar', length: 500, nullable: true })
  correctAnswer: string | null;
}

/** @deprecated Use QuizAttempt instead. */
@Entity('assessment_attempts')
@Index(['assessmentId', 'studentId'])
export class AssessmentAttempt extends BaseEntity {
  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'varchar', length: 20, default: 'in_progress' })
  status: 'in_progress' | 'submitted';

  @Column({ name: 'focus_violations_count', type: 'int', default: 0 })
  focusViolationsCount: number;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;
}
