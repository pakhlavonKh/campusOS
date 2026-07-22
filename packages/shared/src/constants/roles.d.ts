export declare enum SystemRole {
    PLATFORM_ADMIN = "platform_admin",
    ORG_ADMIN = "org_admin",
    BRANCH_ADMIN = "branch_admin",
    TEACHER = "teacher",
    ASSISTANT_TEACHER = "assistant_teacher",
    STUDENT = "student",
    PARENT = "parent"
}
export declare const SYSTEM_ROLES: SystemRole[];
export declare enum Resource {
    ORGANIZATION = "organization",
    BRANCH = "branch",
    USER = "user",
    COURSE = "course",
    MODULE = "module",
    LESSON = "lesson",
    CONTENT_BLOCK = "content_block",
    HOMEWORK = "homework",
    HOMEWORK_SUBMISSION = "homework_submission",
    QUIZ = "quiz",
    QUIZ_ATTEMPT = "quiz_attempt",
    QUESTION = "question",
    QUESTION_BANK = "question_bank",
    GRADE = "grade",
    GRADEBOOK = "gradebook",
    ATTENDANCE = "attendance",
    SCHEDULE = "schedule",
    ROOM = "room",
    GROUP = "group",
    COHORT = "cohort",
    ANNOUNCEMENT = "announcement",
    DISCUSSION = "discussion",
    MESSAGE = "message",
    NOTIFICATION = "notification",
    PAYMENT = "payment",
    INVOICE = "invoice",
    LEAD = "lead",
    REPORT = "report",
    CERTIFICATE = "certificate",
    BADGE = "badge",
    SETTING = "setting",
    AUDIT_LOG = "audit_log",
    WEBHOOK = "webhook",
    FILE = "file"
}
export declare enum Action {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    MANAGE = "manage",
    SUBMIT = "submit",
    GRADE = "grade",
    APPROVE = "approve",
    EXPORT = "export",
    IMPORT = "import"
}
export interface Permission {
    resource: Resource;
    action: Action;
}
export declare const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, Permission[]>;
//# sourceMappingURL=roles.d.ts.map