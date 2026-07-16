// ============================================================
// CampusOS Shared Types — Roles & Permissions
// Based on SRS §2.5 and SDD §5.2
// ============================================================

export enum SystemRole {
  PLATFORM_ADMIN = 'platform_admin',
  ORG_ADMIN = 'org_admin',
  BRANCH_ADMIN = 'branch_admin',
  TEACHER = 'teacher',
  ASSISTANT_TEACHER = 'assistant_teacher',
  STUDENT = 'student',
  PARENT = 'parent',
}

export const SYSTEM_ROLES = Object.values(SystemRole);

export enum Resource {
  ORGANIZATION = 'organization',
  BRANCH = 'branch',
  USER = 'user',
  COURSE = 'course',
  MODULE = 'module',
  LESSON = 'lesson',
  CONTENT_BLOCK = 'content_block',
  HOMEWORK = 'homework',
  HOMEWORK_SUBMISSION = 'homework_submission',
  QUIZ = 'quiz',
  QUIZ_ATTEMPT = 'quiz_attempt',
  QUESTION = 'question',
  QUESTION_BANK = 'question_bank',
  GRADE = 'grade',
  GRADEBOOK = 'gradebook',
  ATTENDANCE = 'attendance',
  SCHEDULE = 'schedule',
  ROOM = 'room',
  GROUP = 'group',
  COHORT = 'cohort',
  ANNOUNCEMENT = 'announcement',
  DISCUSSION = 'discussion',
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  PAYMENT = 'payment',
  INVOICE = 'invoice',
  LEAD = 'lead',
  REPORT = 'report',
  CERTIFICATE = 'certificate',
  BADGE = 'badge',
  SETTING = 'setting',
  AUDIT_LOG = 'audit_log',
  WEBHOOK = 'webhook',
  FILE = 'file',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  SUBMIT = 'submit',
  GRADE = 'grade',
  APPROVE = 'approve',
  EXPORT = 'export',
  IMPORT = 'import',
}

export interface Permission {
  resource: Resource;
  action: Action;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  [SystemRole.PLATFORM_ADMIN]: [
    { resource: '*' as Resource, action: '*' as Action },
  ],
  [SystemRole.ORG_ADMIN]: [
    { resource: Resource.ORGANIZATION, action: Action.MANAGE },
    { resource: Resource.BRANCH, action: Action.MANAGE },
    { resource: Resource.USER, action: Action.MANAGE },
    { resource: Resource.COURSE, action: Action.MANAGE },
    { resource: Resource.SETTING, action: Action.MANAGE },
  ],
  [SystemRole.BRANCH_ADMIN]: [
    { resource: Resource.BRANCH, action: Action.READ },
    { resource: Resource.BRANCH, action: Action.UPDATE },
    { resource: Resource.USER, action: Action.MANAGE },
    { resource: Resource.COURSE, action: Action.MANAGE },
  ],
  [SystemRole.TEACHER]: [
    { resource: Resource.COURSE, action: Action.READ },
    { resource: Resource.LESSON, action: Action.MANAGE },
    { resource: Resource.HOMEWORK, action: Action.MANAGE },
    { resource: Resource.GRADE, action: Action.MANAGE },
    { resource: Resource.ATTENDANCE, action: Action.MANAGE },
    { resource: Resource.ANNOUNCEMENT, action: Action.CREATE },
    { resource: Resource.DISCUSSION, action: Action.MANAGE },
  ],
  [SystemRole.ASSISTANT_TEACHER]: [
    { resource: Resource.COURSE, action: Action.READ },
    { resource: Resource.LESSON, action: Action.READ },
    { resource: Resource.ATTENDANCE, action: Action.CREATE },
  ],
  [SystemRole.STUDENT]: [
    { resource: Resource.COURSE, action: Action.READ },
    { resource: Resource.HOMEWORK, action: Action.SUBMIT },
    { resource: Resource.QUIZ, action: Action.SUBMIT },
  ],
  [SystemRole.PARENT]: [
    { resource: Resource.GRADE, action: Action.READ },
    { resource: Resource.ATTENDANCE, action: Action.READ },
    { resource: Resource.MESSAGE, action: Action.CREATE },
  ],
};
