"use strict";
// ============================================================
// CampusOS Shared Types — Roles & Permissions
// Based on SRS §2.5 and SDD §5.2
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLE_PERMISSIONS = exports.Action = exports.Resource = exports.SYSTEM_ROLES = exports.SystemRole = void 0;
var SystemRole;
(function (SystemRole) {
    SystemRole["PLATFORM_ADMIN"] = "platform_admin";
    SystemRole["ORG_ADMIN"] = "org_admin";
    SystemRole["BRANCH_ADMIN"] = "branch_admin";
    SystemRole["TEACHER"] = "teacher";
    SystemRole["ASSISTANT_TEACHER"] = "assistant_teacher";
    SystemRole["STUDENT"] = "student";
    SystemRole["PARENT"] = "parent";
})(SystemRole || (exports.SystemRole = SystemRole = {}));
exports.SYSTEM_ROLES = Object.values(SystemRole);
var Resource;
(function (Resource) {
    Resource["ORGANIZATION"] = "organization";
    Resource["BRANCH"] = "branch";
    Resource["USER"] = "user";
    Resource["COURSE"] = "course";
    Resource["MODULE"] = "module";
    Resource["LESSON"] = "lesson";
    Resource["CONTENT_BLOCK"] = "content_block";
    Resource["HOMEWORK"] = "homework";
    Resource["HOMEWORK_SUBMISSION"] = "homework_submission";
    Resource["QUIZ"] = "quiz";
    Resource["QUIZ_ATTEMPT"] = "quiz_attempt";
    Resource["QUESTION"] = "question";
    Resource["QUESTION_BANK"] = "question_bank";
    Resource["GRADE"] = "grade";
    Resource["GRADEBOOK"] = "gradebook";
    Resource["ATTENDANCE"] = "attendance";
    Resource["SCHEDULE"] = "schedule";
    Resource["ROOM"] = "room";
    Resource["GROUP"] = "group";
    Resource["COHORT"] = "cohort";
    Resource["ANNOUNCEMENT"] = "announcement";
    Resource["DISCUSSION"] = "discussion";
    Resource["MESSAGE"] = "message";
    Resource["NOTIFICATION"] = "notification";
    Resource["PAYMENT"] = "payment";
    Resource["INVOICE"] = "invoice";
    Resource["LEAD"] = "lead";
    Resource["REPORT"] = "report";
    Resource["CERTIFICATE"] = "certificate";
    Resource["BADGE"] = "badge";
    Resource["SETTING"] = "setting";
    Resource["AUDIT_LOG"] = "audit_log";
    Resource["WEBHOOK"] = "webhook";
    Resource["FILE"] = "file";
})(Resource || (exports.Resource = Resource = {}));
var Action;
(function (Action) {
    Action["CREATE"] = "create";
    Action["READ"] = "read";
    Action["UPDATE"] = "update";
    Action["DELETE"] = "delete";
    Action["MANAGE"] = "manage";
    Action["SUBMIT"] = "submit";
    Action["GRADE"] = "grade";
    Action["APPROVE"] = "approve";
    Action["EXPORT"] = "export";
    Action["IMPORT"] = "import";
})(Action || (exports.Action = Action = {}));
exports.DEFAULT_ROLE_PERMISSIONS = {
    [SystemRole.PLATFORM_ADMIN]: [
        { resource: '*', action: '*' },
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
//# sourceMappingURL=roles.js.map