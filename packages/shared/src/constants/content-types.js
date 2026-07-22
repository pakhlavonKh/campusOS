"use strict";
// ============================================================
// CampusOS Shared Types — Content & Question Types
// Based on SRS §5.7.7 and §5.8.1
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeScaleType = exports.AttendanceStatusType = exports.AntiCheatLevel = exports.CompletionEntityType = exports.SubmissionStatus = exports.HomeworkLatePolicy = exports.CourseStatus = exports.CourseFormat = exports.QuestionType = exports.ContentBlockType = void 0;
var ContentBlockType;
(function (ContentBlockType) {
    ContentBlockType["RICH_TEXT"] = "rich_text";
    ContentBlockType["PDF"] = "pdf";
    ContentBlockType["PRESENTATION"] = "presentation";
    ContentBlockType["IMAGE"] = "image";
    ContentBlockType["IMAGE_GALLERY"] = "image_gallery";
    ContentBlockType["VIDEO"] = "video";
    ContentBlockType["AUDIO"] = "audio";
    ContentBlockType["EXTERNAL_LINK"] = "external_link";
    ContentBlockType["INTERACTIVE"] = "interactive";
    ContentBlockType["WHITEBOARD"] = "whiteboard";
    ContentBlockType["TABLE"] = "table";
    ContentBlockType["CHART"] = "chart";
    ContentBlockType["LATEX"] = "latex";
    ContentBlockType["MATH_FORMULA"] = "math_formula";
    ContentBlockType["CODE_SNIPPET"] = "code_snippet";
    ContentBlockType["CODE_EXECUTION"] = "code_execution";
    ContentBlockType["IMAGE_ANNOTATION"] = "image_annotation";
    ContentBlockType["DIAGRAM_LABELING"] = "diagram_labeling";
    ContentBlockType["DRAWING_CANVAS"] = "drawing_canvas";
    ContentBlockType["FILE_UPLOAD"] = "file_upload";
    ContentBlockType["SPOKEN_RESPONSE"] = "spoken_response";
    ContentBlockType["SCREEN_RECORDING"] = "screen_recording";
})(ContentBlockType || (exports.ContentBlockType = ContentBlockType = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["MULTIPLE_SELECT"] = "multiple_select";
    QuestionType["TRUE_FALSE"] = "true_false";
    QuestionType["MATCHING"] = "matching";
    QuestionType["ORDERING"] = "ordering";
    QuestionType["FILL_IN_BLANK"] = "fill_in_blank";
    QuestionType["CLOZE"] = "cloze";
    QuestionType["NUMERIC"] = "numeric";
    QuestionType["FORMULA"] = "formula";
    QuestionType["SHORT_ANSWER"] = "short_answer";
    QuestionType["ESSAY"] = "essay";
    QuestionType["CODE_SUBMISSION"] = "code_submission";
    QuestionType["FILE_UPLOAD"] = "file_upload";
    QuestionType["AUDIO_SUBMISSION"] = "audio_submission";
    QuestionType["SPOKEN_RESPONSE"] = "spoken_response";
    QuestionType["IMAGE_ANNOTATION"] = "image_annotation";
    QuestionType["DRAG_AND_DROP"] = "drag_and_drop";
    QuestionType["MATRIX_GRID"] = "matrix_grid";
    QuestionType["LIKERT_SCALE"] = "likert_scale";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var CourseFormat;
(function (CourseFormat) {
    CourseFormat["TOPIC_BASED"] = "topic_based";
    CourseFormat["WEEK_BASED"] = "week_based";
    CourseFormat["SEMESTER_BASED"] = "semester_based";
    CourseFormat["SELF_PACED"] = "self_paced";
    CourseFormat["INSTRUCTOR_LED"] = "instructor_led";
})(CourseFormat || (exports.CourseFormat = CourseFormat = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["DRAFT"] = "draft";
    CourseStatus["PUBLISHED"] = "published";
    CourseStatus["ARCHIVED"] = "archived";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
var HomeworkLatePolicy;
(function (HomeworkLatePolicy) {
    HomeworkLatePolicy["ACCEPT"] = "accept";
    HomeworkLatePolicy["DEDUCT"] = "deduct";
    HomeworkLatePolicy["REJECT"] = "reject";
})(HomeworkLatePolicy || (exports.HomeworkLatePolicy = HomeworkLatePolicy = {}));
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["DRAFT"] = "draft";
    SubmissionStatus["SUBMITTED"] = "submitted";
    SubmissionStatus["GRADED"] = "graded";
    SubmissionStatus["RETURNED"] = "returned";
    SubmissionStatus["RESUBMITTED"] = "resubmitted";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
var CompletionEntityType;
(function (CompletionEntityType) {
    CompletionEntityType["LESSON"] = "lesson";
    CompletionEntityType["MODULE"] = "module";
    CompletionEntityType["COURSE"] = "course";
})(CompletionEntityType || (exports.CompletionEntityType = CompletionEntityType = {}));
var AntiCheatLevel;
(function (AntiCheatLevel) {
    AntiCheatLevel["NONE"] = "none";
    AntiCheatLevel["BASIC"] = "basic";
    AntiCheatLevel["STANDARD"] = "standard";
    AntiCheatLevel["STRICT"] = "strict";
    AntiCheatLevel["PROCTORED"] = "proctored";
})(AntiCheatLevel || (exports.AntiCheatLevel = AntiCheatLevel = {}));
var AttendanceStatusType;
(function (AttendanceStatusType) {
    AttendanceStatusType["PRESENT"] = "present";
    AttendanceStatusType["ABSENT"] = "absent";
    AttendanceStatusType["LATE"] = "late";
    AttendanceStatusType["EXCUSED"] = "excused";
})(AttendanceStatusType || (exports.AttendanceStatusType = AttendanceStatusType = {}));
var GradeScaleType;
(function (GradeScaleType) {
    GradeScaleType["LETTER"] = "letter";
    GradeScaleType["PERCENTAGE"] = "percentage";
    GradeScaleType["GPA"] = "gpa";
    GradeScaleType["PASS_FAIL"] = "pass_fail";
    GradeScaleType["CUSTOM"] = "custom";
})(GradeScaleType || (exports.GradeScaleType = GradeScaleType = {}));
//# sourceMappingURL=content-types.js.map