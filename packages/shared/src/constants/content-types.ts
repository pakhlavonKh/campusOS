// ============================================================
// CampusOS Shared Types — Content & Question Types
// Based on SRS §5.7.7 and §5.8.1
// ============================================================

export enum ContentBlockType {
  RICH_TEXT = 'rich_text',
  PDF = 'pdf',
  PRESENTATION = 'presentation',
  IMAGE = 'image',
  IMAGE_GALLERY = 'image_gallery',
  VIDEO = 'video',
  AUDIO = 'audio',
  EXTERNAL_LINK = 'external_link',
  INTERACTIVE = 'interactive',
  WHITEBOARD = 'whiteboard',
  TABLE = 'table',
  CHART = 'chart',
  LATEX = 'latex',
  MATH_FORMULA = 'math_formula',
  CODE_SNIPPET = 'code_snippet',
  CODE_EXECUTION = 'code_execution',
  IMAGE_ANNOTATION = 'image_annotation',
  DIAGRAM_LABELING = 'diagram_labeling',
  DRAWING_CANVAS = 'drawing_canvas',
  FILE_UPLOAD = 'file_upload',
  SPOKEN_RESPONSE = 'spoken_response',
  SCREEN_RECORDING = 'screen_recording',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  MULTIPLE_SELECT = 'multiple_select',
  TRUE_FALSE = 'true_false',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  FILL_IN_BLANK = 'fill_in_blank',
  CLOZE = 'cloze',
  NUMERIC = 'numeric',
  FORMULA = 'formula',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  CODE_SUBMISSION = 'code_submission',
  FILE_UPLOAD = 'file_upload',
  AUDIO_SUBMISSION = 'audio_submission',
  SPOKEN_RESPONSE = 'spoken_response',
  IMAGE_ANNOTATION = 'image_annotation',
  DRAG_AND_DROP = 'drag_and_drop',
  MATRIX_GRID = 'matrix_grid',
  LIKERT_SCALE = 'likert_scale',
}

export enum CourseFormat {
  TOPIC_BASED = 'topic_based',
  WEEK_BASED = 'week_based',
  SEMESTER_BASED = 'semester_based',
  SELF_PACED = 'self_paced',
  INSTRUCTOR_LED = 'instructor_led',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum HomeworkLatePolicy {
  ACCEPT = 'accept',
  DEDUCT = 'deduct',
  REJECT = 'reject',
}

export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  RETURNED = 'returned',
  RESUBMITTED = 'resubmitted',
}

export enum CompletionEntityType {
  LESSON = 'lesson',
  MODULE = 'module',
  COURSE = 'course',
}

export enum AntiCheatLevel {
  NONE = 'none',
  BASIC = 'basic',
  STANDARD = 'standard',
  STRICT = 'strict',
  PROCTORED = 'proctored',
}

export enum AttendanceStatusType {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export enum GradeScaleType {
  LETTER = 'letter',
  PERCENTAGE = 'percentage',
  GPA = 'gpa',
  PASS_FAIL = 'pass_fail',
  CUSTOM = 'custom',
}
