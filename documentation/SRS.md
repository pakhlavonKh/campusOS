# Software Requirements Specification (SRS)

**Project:** CampusOS — Subject-Agnostic Education Platform

**Version:** 2.0

**Status:** Draft

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | July 2026 | Product Team | Initial draft |
| 1.1 | July 2026 | Product Team | Aligned with assignment docs |
| 2.0 | July 2026 | Product Team | Major expansion — LMS, Assessment Engine, Gradebook, Groups and Cohorts, Collaboration, Reporting, Gamification, Voice and Pronunciation, Accessibility, Content Portability, Domain Generalization, and Enterprise Features |

---

## Table of Contents

1. Introduction
2. Overall Description
3. System Architecture
4. Technology Stack
5. Functional Requirements
   - 5.1 Authentication
   - 5.2 Organizations
   - 5.3 Branches
   - 5.4 Students
   - 5.5 Parents
   - 5.6 Teachers
   - 5.7 Learning Management System (LMS)
   - 5.8 Assessment Engine
   - 5.9 Gradebook
   - 5.10 Groups and Cohorts
   - 5.11 Collaboration
   - 5.12 Attendance
   - 5.13 Schedule and Calendar
   - 5.14 Messaging
   - 5.15 Notifications
   - 5.16 Payments
   - 5.17 CRM
   - 5.18 Finance
   - 5.19 Website Builder
   - 5.20 Reporting and Analytics
   - 5.21 Gamification
   - 5.22 Voice and Pronunciation
   - 5.23 Automation
   - 5.24 Content Portability
   - 5.25 Marketplace
   - 5.26 Frontend Theming and Customization
   - 5.27 Student and Parent Web Portal
   - 5.28 Platform Super Admin Desktop Application
   - 5.29 Per-Organization App Provisioning and Maintenance
   - 5.30 Unified Login with Role-Based Rendering
6. Non-Functional Requirements
7. Business Rules
8. Domain Model
9. Database Specification
10. API Specification
11. UI Requirements
12. Mobile Specification
13. Security
14. DevOps
15. Testing
16. Deployment
17. Roadmap
18. Risks
19. Appendices

---

## 1. Introduction

### 1.1 Purpose

This document defines the product and technical requirements for CampusOS, a multi-tenant, subject-agnostic education SaaS platform. It is detailed enough to support implementation planning, API design, UI design, test design, and enterprise deployment across diverse educational domains.

### 1.2 Scope

The platform serves education organizations that operate as a single branch or as multi-branch networks. It includes web, desktop, and mobile experiences for all roles, including a dedicated web portal for students and parents alongside native mobile apps. The platform is designed to be domain-agnostic and extensible to any educational discipline without modifying the core architecture.

### 1.3 Definitions

- **Organization:** A customer account representing an education center, institution, or chain brand.
- **Branch:** A physical or virtual location under an organization.
- **Tenant:** An isolated customer data boundary.

- **LMS:** Learning Management System — the subsystem managing courses, content, and learning progression.
- **Assessment Engine:** The subsystem managing question banks, quizzes, exams, grading, and anti-cheat.
- **Gradebook:** The subsystem managing grade recording, calculation, scales, and reporting.
- **Content Portability:** The ability to export, import, clone, version, and distribute educational content across tenants.
- **RBAC:** Role-Based Access Control.
- **ABAC:** Attribute-Based Access Control.

### 1.4 References

- BusinessModel.md
- 00-Project/00-Project-Overview.md
- 00-Project/01-Project-Vision.md
- Technical_Assignment_Education_SaaS_Platform.docx

### 1.5 Intended Audience

Product, engineering, design, QA, DevOps, support, and curriculum design teams.

### 1.6 Business Goals

Enable subscription revenue per branch, support white-label customer onboarding, reduce manual administration, and serve any educational domain without platform modification.

### 1.7 Domain Generalization Statement

The platform is explicitly subject-agnostic. The content engine, assessment engine, and reporting subsystems are extensible so that new disciplines can be supported without modifying the core architecture. Supported domains include but are not limited to:

- Language schools
- Mathematics
- Physics
- Chemistry
- Biology
- Computer Science and Programming
- Engineering
- Business and Accounting
- Medicine
- Music
- Art
- Exam preparation
- Universities
- K–12 schools
- Corporate training
- Professional certification
- Tutoring centers
- Vocational education

---

## 2. Overall Description

### 2.1 Product Perspective

The platform is an education operating system rather than a single-purpose LMS. It combines learning management, assessment, grading, collaboration, business operations, communication, finance, analytics, gamification, voice and pronunciation, and automation into one product.

### 2.2 Product Vision

Become the primary software layer used by education organizations of any discipline to manage teaching, learning, and operations.

### 2.3 Product Positioning

The product is positioned for tutoring centers, language schools, prep academies, private schools, franchise education networks, universities, K–12 schools, corporate training providers, professional certification bodies, and vocational education centers.

### 2.4 Business Model

Subscription pricing is per branch, with optional paid modules, usage-based communication credits, storage upgrades, white-label licensing, and enterprise add-ons. Feature and module licensing is enforced per tenant.

### 2.5 User Classes

- **Platform Super Admin:** Manages all tenants, billing, usage, and support. Uses a dedicated, internally-distributed desktop application, separate from the customer-facing product (see 5.28).
- **Organization Owner/Admin:** Manages the organization and all branches.
- **Branch Admin:** Manages a single branch.
- **Teacher:** Manages classes, content, homework, attendance, exams, grading, and communication.
- **Assistant Teacher:** A fully configurable role using granular capabilities per organization.
- **Student:** Web and mobile user focused on learning, submissions, and collaboration. Mobile is optimized for daily use (notifications, quick submissions); web offers the same core workflows for desktop/browser use.
- **Parent:** Web and mobile user focused on child progress, communication, and payments where enabled. Same dual-access rationale as Student.

### 2.6 Operating Environment

Web and desktop for organization/branch administrative, teaching, and staff roles. Native mobile apps for iOS and Android for all roles. A dedicated student/parent web portal provides the same core workflows (homework, grades, attendance, messaging, payments) as the mobile apps for browser/desktop use. Platform Super Admin uses a separate, internally-distributed desktop application, isolated from the customer-facing web/desktop/mobile builds (see 5.28).

### 2.7 Design Constraints

- Multi-tenant isolation is mandatory.
- White-label customization must not require code changes.
- APIs must be versioned.
- Mobile and web clients must use the same backend contracts.
- The Platform Super Admin application must be built and distributed separately from the customer-facing web/desktop/mobile applications; no internal platform-management code may ship inside a customer-facing build.
- The platform must support fine-grained RBAC and ABAC.
- Speech and voice providers must be abstracted behind interfaces.

### 2.8 Assumptions

- Organizations may have one or many branches.
- Some modules are disabled per subscription tier.
- Mobile connectivity may be intermittent, so offline-aware behavior is required for selected flows.
- Organizations may operate in any educational domain.
- Content types and assessment types are generic and not domain-specific.

### 2.9 Dependencies

PostgreSQL, object storage, Redis, push notification providers, SMS or messaging providers, payment gateways where billing is enabled, speech and pronunciation service providers, media transcoding services, and calendar integration providers.

---

## 3. System Architecture

### 3.1 High-Level Architecture

Use a modular monolith with clear internal module boundaries. Start with shared infrastructure and evolve specific modules into services only if operational pressure justifies it. The LMS, Assessment Engine, Gradebook, and Voice subsystems are distinct bounded contexts within the monolith.

### 3.2 Architectural Principles

- Domain-driven design for bounded contexts.
- Event-driven workflows for notifications, reporting, gamification triggers, and completion tracking.
- Repository and service layers for clean persistence boundaries.
- Dependency injection for testability.
- Feature flags for subscription gating and phased rollout.
- Plugin-style integration points for payments, messaging, speech providers, and calendar providers.
- Provider abstraction layers for speech services and media services.
- Fine-grained RBAC combined with ABAC for access control.

### 3.3 Multi-Tenant Model

Use shared database and shared schema with organization_id and branch_id on tenant-scoped tables. Enforce tenant isolation through PostgreSQL row-level security and application-level authorization.

### 3.4 Shared Services

Authentication, authorization, audit logging, notifications, file storage access, feature flag evaluation, media transcoding, speech provider routing, search indexing, and webhook dispatch are shared services used by all modules.

### 3.5 Media Pipeline

Support a media transcoding and streaming pipeline for video, audio, and presentation content. Media uploads are processed asynchronously, transcoded into delivery-optimized formats, and served through CDN-backed streaming endpoints.

### 3.6 Search Infrastructure

Provide advanced search across all academic content including courses, lessons, questions, discussions, and resources. Support full-text search, faceted filtering, and tenant-scoped indexing.

### 3.7 Webhook System

Support API webhooks for integrations. Organizations may register webhook endpoints that receive event notifications for academic events, enrollment changes, grade updates, attendance records, and administrative actions.

---

## 4. Technology Stack

- **Frontend:** React and TypeScript for web, React Native for mobile.
- **Backend:** Node.js with NestJS or Python with Django or FastAPI.
- **Database:** PostgreSQL.
- **Cache and jobs:** Redis.
- **Storage:** S3-compatible object storage.
- **Search:** Elasticsearch or equivalent full-text search engine.
- **Media:** Transcoding pipeline (FFmpeg-based or managed service) with CDN delivery.
- **Speech providers:** Azure Speech, Google Cloud Speech, Deepgram, AssemblyAI (behind provider abstraction).
- **Calendar:** Google Calendar API, Microsoft Outlook Calendar API.
- **Identity:** Pluggable identity providers supporting SSO, LDAP, SAML, and OAuth.
- **Infrastructure:** Containers on managed cloud hosting initially, Kubernetes later if needed.
- **Monitoring:** Sentry plus metrics and logs.
- **CI/CD:** GitHub Actions.
- **Security:** TLS, encryption at rest, MFA for admins, secret management, regular dependency scanning, and virus scanning for uploads.

---

## 5. Functional Requirements

### 5.1 Authentication

Support email, phone, password, OAuth or SSO where applicable, refresh tokens, MFA for privileged roles, invitation flows, session revocation, and pluggable identity providers including SSO, LDAP, SAML, and OAuth.

### 5.2 Organizations

Create, update, suspend, and archive organizations. Support consolidated billing, brand settings, and feature/module licensing per tenant.

### 5.3 Branches

Create and manage branches, branch-specific settings, schedules, staff assignments, branch reporting, and resource/classroom management.

### 5.4 Students

Manage profiles, enrollments, attendance, homework, grades, files, notifications, and learning progress tracking.

### 5.5 Parents

Support linked child accounts, progress visibility, communication, notifications, payments where enabled, and parent-facing gamification rewards.

### 5.6 Teachers

Support lesson planning, content posting, homework, grading, attendance, exams, parent communication, and collaboration tools.

---

### 5.7 Learning Management System (LMS)

The LMS is the core academic subsystem. It replaces the previous Courses, Lessons, Homework, and Exams sections with a comprehensive learning management module.

#### 5.7.1 Course Structure

The platform supports a hierarchical course structure with the following entities:

- **Subject:** A broad academic discipline (e.g., Mathematics, English, Physics).
- **Program:** A long-term learning track that spans multiple courses (e.g., Bachelor of Computer Science, IELTS Preparation Program).
- **Course:** A structured learning experience within a subject (e.g., Algebra I, Conversational English).
- **Level:** A proficiency tier within a subject or course (e.g., Beginner, Intermediate, Advanced, A1–C2).
- **Curriculum:** A defined sequence of courses, modules, and assessments for a program or level.
- **Module:** A thematic grouping of lessons within a course (e.g., Module 3: Quadratic Equations).
- **Section:** A subdivision within a module for granular organization.
- **Lesson:** A single teaching session or content unit.
- **Unit:** A grouping mechanism for lessons or topics within a section.
- **Topic:** The most granular content element, representing a specific concept or skill.

All entities support metadata including title, description, thumbnail, tags, estimated duration, difficulty level, learning outcomes, and custom fields.

#### 5.7.2 Course Formats

The platform supports the following course formats:

- **Topic-based courses:** Organized by topic hierarchy without time constraints.
- **Week-based courses:** Content is organized and released by week.
- **Semester-based courses:** Content aligns with academic semester schedules.
- **Self-paced courses:** Students progress at their own speed with no imposed schedule.
- **Instructor-led courses:** A teacher controls pacing, with live sessions and scheduled activities.

A single course may combine formats (e.g., instructor-led with self-paced review modules).

#### 5.7.3 Modular Course Structure

- **Drag-and-drop ordering:** Teachers and admins can reorder modules, lessons, and topics via drag-and-drop.
- **Nested modules:** Modules may contain sub-modules to arbitrary depth within configured limits.
- **Lesson hierarchy:** Lessons may be grouped within units, sections, or modules.
- **Reusable lesson blocks:** Individual lessons, content blocks, and activities can be reused across multiple courses without duplication.
- **Content blocks:** Atomic content elements (text, media, quiz, activity) that compose a lesson.

#### 5.7.4 Course Templates

- **Create template:** Save any course structure as a reusable template.
- **Template library:** Organization-level and platform-level template libraries.
- **Apply template:** Create a new course from a template, pre-populating structure and content.
- **Template versioning:** Templates are versioned; applying a template locks to a specific version.

#### 5.7.5 Course Operations

The following operations are supported for courses, modules, and lessons:

- **Clone course:** Create an identical copy within the same branch.
- **Duplicate course:** Create a copy with a new identity and optional modifications.
- **Export course:** Export course structure and content as a portable package.
- **Import course:** Import a course package into a branch.

These operations work across:

- **Branches:** Clone or transfer courses between branches within the same organization.
- **Organizations:** Share courses between organizations where permissions allow.
- **Marketplace:** Publish courses to the marketplace for other organizations to acquire.

#### 5.7.6 Completion Tracking

The platform tracks completion at multiple levels:

- **Lesson completion:** A lesson is marked complete when all required activities and content blocks are finished.
- **Module completion:** A module is marked complete when all required lessons within it are complete.
- **Course completion:** A course is marked complete when all required modules and assessments are complete.

**Prerequisites and unlock conditions:**

The platform supports configurable prerequisite rules that control content availability:

- A lesson may require completion of one or more prior lessons (e.g., Lesson 2 unlocks after Lesson 1 is complete).
- A quiz may require completion of a prior homework assignment (e.g., Quiz unlocks after Homework is submitted).
- A final exam may require completion of all modules (e.g., Final Exam unlocks after all modules are complete).
- Prerequisites may be based on: completion status, minimum grade, time elapsed, date, or manual unlock by teacher.
- Unlock conditions are evaluated in real time and reflected in the student's course view.

**Completion certificates:** Upon course completion, the system may generate a digital completion certificate (see Gamification, section 5.21).

#### 5.7.7 Content Types

The LMS supports generic education content, not limited to any specific domain. The following content types are supported within lessons and content blocks:

- **Rich text:** Formatted text with headings, lists, bold, italic, links, and embedded media.
- **PDF:** Embedded PDF viewer with page navigation.
- **Presentations:** Slide-based content with navigation controls.
- **Images:** Single images, image galleries, and annotated images.
- **Video:** Uploaded or embedded video with playback controls, timestamps, and optional captions.
- **Audio:** Audio files with playback controls.
- **External links:** Links to external resources, websites, or tools.
- **Interactive blocks:** Embedded interactive content (H5P-style or custom).
- **Whiteboard:** Collaborative or instructional whiteboard canvas.
- **Tables:** Structured tabular data.
- **Charts:** Data visualizations (bar, line, pie, scatter, etc.).
- **LaTeX:** Rendered LaTeX for mathematical and scientific notation.
- **Mathematical formulas:** Formula editor with visual input and rendered output.
- **Code snippets:** Syntax-highlighted code blocks with language detection.
- **Code execution:** Optional sandboxed code execution environment for programming courses.
- **Image annotation:** Tools for annotating, labeling, and marking up images.
- **Diagram labeling:** Interactive diagram labeling exercises.
- **Drawing canvas:** Freehand drawing and sketching tool.
- **File uploads:** Students may upload files as part of lesson activities.
- **Spoken response:** Students may record and submit audio responses.
- **Screen recording submission:** Students may record and submit screen recordings.

This content type system makes the platform suitable for:

Mathematics, Physics, Biology, Programming, Engineering, Languages, Business, Music, Art, Chemistry, Computer Science, Medicine, and any other discipline.

#### 5.7.8 Homework

- **Assignment creation:** Teachers create homework assignments linked to lessons, modules, or courses.
- **Submission:** Students submit work via text, file upload, code submission, audio, or screen recording.
- **Grading:** Manual or automatic grading with rubrics.
- **Rubrics:** Configurable rubrics with criteria and point scales.
- **Reminders:** Automated reminders for upcoming and overdue assignments.
- **Late policies:** Configurable late submission policies (accept late, deduct points, reject).
- **Resubmission:** Configurable resubmission rules (number of attempts, deadline extension).
- **Peer review:** Optional peer review workflows.

---

### 5.8 Assessment Engine

The Assessment Engine is a comprehensive subsystem for creating, delivering, grading, and analyzing assessments. It replaces the previous Exams section.

#### 5.8.1 Question Bank

The platform maintains a reusable question bank organized by:

- **Category:** Hierarchical categorization of questions.
- **Tags:** Freeform tags for flexible organization.
- **Difficulty:** Configurable difficulty levels (e.g., Easy, Medium, Hard, or numeric scales).
- **Subject:** Linked to the subject taxonomy.
- **Curriculum:** Linked to specific curricula or learning standards.
- **Learning outcome:** Each question may be mapped to one or more learning outcomes.

**Question types supported:**

- **Multiple choice:** Single correct answer from a set of options.
- **Multiple select:** One or more correct answers from a set of options.
- **True/False:** Binary true or false selection.
- **Matching:** Match items from two columns.
- **Ordering:** Arrange items in the correct sequence.
- **Fill in the blank:** Type the correct word or phrase into a blank.
- **Cloze:** Text with multiple embedded blanks (fill-in-the-blank within a paragraph).
- **Numeric:** Enter a numeric answer with optional tolerance range.
- **Formula:** Enter a mathematical formula or expression; evaluated for correctness.
- **Short answer:** Free-text short response.
- **Essay:** Free-text long response.
- **Code submission:** Submit code that is evaluated against test cases.
- **File upload:** Upload a file as a response.
- **Audio submission:** Record and submit an audio response.
- **Spoken response:** Speech-to-text evaluated response.
- **Image annotation:** Annotate, label, or mark up an image.
- **Drag and drop:** Drag items to correct positions or categories.
- **Matrix/grid:** Select answers in a matrix or grid format.
- **Likert scale:** Rate items on a scale (e.g., Strongly Disagree to Strongly Agree).

Each question supports:

- Question text with rich content (images, LaTeX, code, media).
- Explanation and feedback text (shown after answering).
- Hints (optional, configurable number of hints allowed).
- Point value and partial credit rules.
- Version history.

#### 5.8.2 Quiz Builder

The quiz builder allows teachers and admins to construct assessments with the following capabilities:

- **Randomized question pools:** Draw a configurable number of questions randomly from a pool or category.
- **Random ordering:** Randomize the order of questions and/or answer options per attempt.
- **Question groups:** Organize questions into groups with per-group settings.
- **Weighted questions:** Assign different point weights to individual questions or groups.
- **Multiple attempts:** Allow configurable number of attempts with best, average, or last score used.
- **Time limits:** Set time limits per quiz or per question.
- **Availability windows:** Set start and end dates/times for quiz availability.
- **Password-protected quizzes:** Require a password to start the quiz.
- **IP restrictions:** Restrict quiz access to specific IP addresses or ranges.
- **Open-book mode:** Indicate that the quiz is open-book (informational flag, may relax anti-cheat).
- **Practice mode:** Allow unlimited attempts with no grade recording; immediate feedback shown.
- **Adaptive mode:** Questions adapt based on previous answers (e.g., harder questions after correct answers).

#### 5.8.3 Grading

The assessment engine supports multiple grading modes:

- **Auto grading:** Automatic scoring for objective question types (multiple choice, true/false, numeric, matching, ordering, fill-in-the-blank, code submission with test cases).
- **Manual grading:** Teacher reviews and scores subjective question types (essay, short answer, file upload).

- **Rubrics:** Define grading rubrics with criteria, levels, and point values. Rubrics may be reused across assessments.
- **Partial credit:** Award partial points for partially correct answers (configurable per question type).
- **Negative marking:** Optionally deduct points for incorrect answers.
- **Multiple graders:** Assign multiple graders to the same assessment for reliability.
- **Moderation workflow:** A moderation step where a senior teacher or admin reviews and approves grades before publication.

#### 5.8.4 Feedback

The platform supports configurable feedback delivery:

- **Immediate feedback:** Shown to the student immediately after answering each question.
- **Delayed feedback:** Shown after the quiz is submitted or after a configured delay.
- **Manual feedback:** Teacher writes and publishes feedback manually.
- **Per-question feedback:** Feedback is specific to each question (correct answer explanation, hints).
- **Per-attempt feedback:** Feedback summarizes the entire attempt (score, strengths, weaknesses).
- **Overall feedback:** General feedback for the assessment as a whole.

Feedback may include text, media, and links.

#### 5.8.5 Anti-Cheat

The platform includes the following anti-cheat measures for proctored assessments:

- **Tab switching detection:** Detect and log when the student switches browser tabs during an exam.
- **Window blur detection:** Detect and log when the exam window loses focus.
- **Full-screen monitoring:** Require full-screen mode during the exam; detect exits.
- **Clipboard monitoring:** Detect clipboard copy and paste operations.
- **Copy/paste restrictions:** Disable copy, paste, and right-click within the exam interface.
- **Browser lockdown mode:** Optionally require a lockdown browser that prevents access to other applications.
- **Webcam monitoring (optional):** Capture periodic webcam snapshots or video for proctoring review.
- **Microphone monitoring (optional):** Capture ambient audio for proctoring review.
- **Statistical cheating detection:** Analyze submission patterns, answer timing, and content for indicators of copied responses.
- **Suspicious behavior logs:** Maintain a detailed log of all flagged behaviors per attempt.
- **Automatic attempt submission:** Automatically submit the attempt if too many violations occur or time expires.
- **Time synchronization:** Use server-side time to prevent client-side clock manipulation.
- **Audit logs:** All exam activity including start, end, navigation, flagged events, and submissions are recorded in audit logs.

Anti-cheat intensity is configurable per assessment (none, basic, standard, strict, proctored).

---

### 5.9 Gradebook

The Gradebook is a dedicated subsystem for managing, calculating, and reporting student grades.

#### 5.9.1 Weighted Categories

Grades are organized into weighted categories. Each category contributes a configurable percentage to the final grade. Example configuration:

| Category | Weight |
|----------|--------|
| Homework | 20% |
| Projects | 30% |
| Exams | 40% |
| Participation | 10% |

- Teachers or admins configure categories and weights per course.
- Individual assignments within a category contribute equally or with custom weights.
- The system calculates running totals and projected final grades.

#### 5.9.2 Grade Scales

The platform supports multiple grade scales:

- **Letter grades:** A, A-, B+, B, B-, C+, C, C-, D, F (or custom letter scales).
- **Percentage:** 0–100% with configurable passing threshold.
- **GPA:** Grade point average on a configurable scale (e.g., 4.0, 5.0, 10.0).
- **Pass/Fail:** Binary pass or fail designation.
- **Custom scales:** Organizations may define custom grade scales with custom labels and ranges.

Grade scale mapping is configurable per organization, program, or course.

#### 5.9.3 Rubrics and Advanced Grading

- **Rubrics:** Reusable rubrics with criteria rows, level columns, and point values.
- **Analytic rubrics:** Each criterion is scored independently.
- **Holistic rubrics:** A single overall score is assigned based on a holistic description.
- **Rubric templates:** Save and reuse rubrics across courses and organizations.

#### 5.9.4 Grade History and Audit

- **Grade history:** Every grade change is recorded with timestamp, old value, new value, and the user who made the change.
- **Grade revisions:** Teachers may revise grades with a required reason.
- **Audit logs:** All grade-related actions (entry, edit, deletion, approval) are recorded in the audit log.
- **Grade approval workflow:** Optionally require admin or department head approval before grades are published to students and parents.

#### 5.9.5 Reporting and Export

- **Export to Excel:** Export gradebook data to Excel or CSV format.
- **Printable report cards:** Generate branded, printable report cards per student per term.
- **Transcript generation:** Generate academic transcripts with cumulative GPA and course history.
- **Grade analytics:** View grade distributions, averages, medians, and trends per course, class, or branch.

---

### 5.10 Groups and Cohorts

#### 5.10.1 Groups

- **Groups:** Create named groups of students within a branch or course.
- **Subgroups:** Groups may contain subgroups for finer organization.
- **Project groups:** Temporary groups formed for collaborative assignments or projects.
- **Learning cohorts:** Named cohorts that progress through a program together (e.g., Fall 2026 Cohort).

#### 5.10.2 Enrollment

- **Batch enrollment:** Enroll multiple students into a group, course, or cohort simultaneously.
- **Bulk enrollment:** Import enrollment lists from CSV or spreadsheet.
- **Bulk transfers:** Transfer groups of students between branches, courses, or cohorts.
- **Enrollment rules:** Define automatic enrollment rules based on criteria (e.g., all Level 3 students auto-enroll in Advanced Grammar).

#### 5.10.3 Group-Scoped Features

- **Group-specific assignments:** Assign homework or assessments to specific groups rather than entire classes.
- **Group-specific announcements:** Post announcements visible only to specific groups.
- **Group-specific content:** Release lessons or modules to specific groups on different schedules.
- **Group visibility:** Configure which groups can see or interact with each other.
- **Group-level reporting:** View engagement, grades, and completion at the group level.

---

### 5.11 Collaboration

#### 5.11.1 Announcements

- **Teacher announcements:** Teachers post announcements to courses, classes, or groups.
- **Admin announcements:** Branch or organization-wide announcements.
- **Pinned announcements:** Pin important announcements to the top of the feed.
- **Scheduled announcements:** Schedule announcements for future publication.
- **Read receipts:** Track which students and parents have read announcements.

#### 5.11.2 Discussion Threads

- **Discussion forums:** Create threaded discussion forums within courses or classes.
- **Teacher posts:** Teachers can create discussion prompts and seed threads.
- **Student replies:** Students respond to threads with text, attachments, or media.
- **Comments:** Nested comments on posts for deeper conversation.
- **Attachments:** Attach files, images, and links to posts and comments.
- **Reactions:** Emoji reactions on posts and comments (like, helpful, insightful, etc.).
- **Moderation:** Teachers can edit, delete, or lock threads. Flagging system for inappropriate content.

#### 5.11.3 Class Q&A

- **Q&A board:** A dedicated question-and-answer board for each course or class.
- **Upvoting:** Students can upvote questions to surface the most relevant ones.
- **Answered marking:** Teachers mark questions as answered; answers are highlighted.
- **Anonymous questions:** Optionally allow anonymous question posting.

#### 5.11.4 Office Hours

- **Office hours scheduling:** Teachers define available office hours.
- **Booking:** Students book time slots during office hours.
- **Virtual office hours:** Integration with video conferencing for remote office hours.
- **Queue management:** Teachers see a queue of students waiting during office hours.

---

### 5.12 Attendance

Support manual attendance now, with QR-based and biometric modes as add-ons.

- Track attendance per lesson, per class, per day.
- Support statuses: present, absent, late, excused, and custom statuses.
- Attendance records are immutable except through audited correction flows.
- Generate attendance reports and trend analytics.
- Notify parents of absences in real time where configured.


---

### 5.13 Schedule and Calendar

- Support class timetables, exam calendars, and room or resource booking.
- **Resource and classroom management:** Track room availability, capacity, equipment, and scheduling conflicts.
- **Calendar synchronization:** Sync schedules with Google Calendar and Microsoft Outlook Calendar.
- **Recurring events:** Support recurring class schedules, office hours, and events.
- **Conflict detection:** Detect and alert on scheduling conflicts for teachers, rooms, and students.
- **Student schedule view:** Students see their personalized schedule across all enrolled courses.

---

### 5.14 Messaging

Support in-app messaging and notification delivery. External channels such as SMS or WhatsApp are optional add-ons.

- Direct messaging between teachers, students, and parents (where permitted by role).
- Group messaging for classes and cohorts.
- Message threading and reply support.
- File and media attachments.
- Message search and filtering.

---

### 5.15 Notifications

Support push, email, SMS, and in-app notifications with templates and delivery tracking.

- Notification preferences per user (opt-in/opt-out per channel and category).
- Template-based notifications with variable substitution.
- Delivery status tracking (sent, delivered, read, failed).
- Scheduled notifications and digest modes.


---

### 5.16 Payments

Support invoice generation, payment collection, reminders, and provider integration when enabled.

- Configurable payment schedules (monthly, term-based, per-course).
- Multiple payment methods.
- Payment reminders and overdue notifications.
- Payment history and receipts.
- Refund and credit management.

---

### 5.17 CRM

Support lead capture, inquiry tracking, and onboarding pipeline tracking.

- Lead sources and attribution.
- Inquiry management with status tracking.
- Follow-up reminders and task assignment.
- Conversion tracking from lead to enrolled student.
- Integration with Website Builder for lead capture forms.

---

### 5.18 Finance

Support revenue reporting, subscription billing, payment reconciliation, and usage-based billing.

- Revenue dashboards per branch and organization.
- Accounts receivable and aging reports.
- Usage-based billing for storage and communication credits.
- Financial export and integration with accounting systems.

---

### 5.19 Website Builder

Support branded public pages and lead capture pages for organizations that enable it.

- Drag-and-drop page builder.
- Branded templates with organization colors, logos, and fonts.
- Course catalog pages.
- Lead capture forms with CRM integration.
- SEO-optimized page output.
- Custom domain support.

---

### 5.20 Reporting and Analytics

The reporting subsystem covers both business metrics and academic analytics.

#### 5.20.1 Business Analytics

- Attendance trends.
- Enrollment and retention rates.
- Revenue and payment metrics.
- Branch performance comparison.
- Usage dashboards.
- Teacher activity and workload.

#### 5.20.2 Student Engagement Analytics

- **Lesson completion rates:** Track completion percentages per lesson, module, and course.
- **Homework completion rates:** Track submission rates and on-time rates.
- **Activity timelines:** Visualize student activity over time.
- **Login frequency:** Track how often students log in.
- **Time spent:** Track time spent on lessons, modules, courses, and the platform overall.
- **Content interaction:** Track which content types are most engaged with.

#### 5.20.3 Teacher Engagement Analytics

- Content creation frequency.
- Grading turnaround time.
- Communication responsiveness.
- Lesson planning activity.
- Student interaction frequency.

#### 5.20.4 Assessment Analytics

- **Question difficulty:** Calculate difficulty indices for each question based on response data.
- **Question discrimination:** Calculate discrimination indices to identify questions that differentiate between high and low performers.
- **Score distributions:** Visualize score distributions per assessment.
- **Item analysis:** Detailed analysis of individual question performance.
- **Assessment reliability:** Calculate reliability metrics (Cronbach's alpha, KR-20 where applicable).

#### 5.20.5 Learning Outcome Analytics

- **Learning outcome achievement:** Track student progress against defined learning outcomes.
- **Competency mapping:** Map assessments and activities to competencies and track mastery.
- **Curriculum coverage:** Identify gaps in curriculum coverage based on content and assessment mapping.


---

### 5.21 Gamification

Gamification is an optional module that can be enabled or disabled per organization.

#### 5.21.1 Core Gamification Elements

- **Badges:** Award badges for achievements (e.g., "First Homework Submitted," "Perfect Score," "100-Day Streak").
- **Achievements:** Define multi-step achievements with progress tracking.
- **XP (Experience Points):** Award XP for completing activities, lessons, quizzes, and interactions.
- **Points:** A separate points system (distinct from XP) for organization-defined rewards.
- **Leaderboards:** Ranked leaderboards per class, course, branch, or organization. Configurable visibility and opt-in/opt-out.

#### 5.21.2 Engagement Features

- **Daily streaks:** Track consecutive days of platform activity.
- **Weekly streaks:** Track consecutive weeks of meeting engagement goals.
- **Learning challenges:** Time-limited challenges with specific goals and rewards (e.g., "Complete 5 lessons this week").
- **Milestones:** Celebrate learning milestones (e.g., 50 lessons completed, 1000 XP earned).

#### 5.21.3 Certificates and Rewards

- **Certificates:** Generate branded digital certificates upon course completion, program completion, or achievement of specific milestones.
- **Digital certificate generation:** Certificates include unique identifiers, QR codes, and verification URLs.
- **Certificate verification:** Public verification endpoint for validating certificate authenticity.
- **Rewards:** Organization-defined rewards that students can earn with points (e.g., extra credit, merchandise, privileges).
- **Parent rewards:** Parents can define additional rewards for their children based on achievements.
- **Organization achievements:** Organization-wide achievements and competitions.

---

### 5.22 Voice and Pronunciation

The Voice and Pronunciation module supports speech-based learning activities and assessments. It is a standalone functional section applicable to language learning, oral examination, reading fluency, and any discipline requiring spoken responses.

#### 5.22.1 Speech and Pronunciation Practice

- **Record audio:** Students record audio directly within the platform.
- **Compare against target pronunciation:** Compare student audio against a reference pronunciation.
- **Speech-to-text:** Transcribe student audio to text for analysis and grading.
- **Pronunciation scoring:** Score pronunciation on the following dimensions:
  - **Fluency:** Smoothness and flow of speech.
  - **Completeness:** Whether all expected words and sounds are present.
  - **Accuracy:** Correctness of individual sounds and words.
- **Word-level highlighting:** Highlight individual words as correct, incorrect, or partially correct.
- **Phoneme-level scoring:** Where the provider supports it, provide phoneme-level analysis and scoring.
- **Reading fluency:** Assess reading fluency by having students read a passage aloud.
- **Oral exams:** Conduct oral examinations with recorded responses and scoring.
- **Speaking assignments:** Assign speaking tasks with specific prompts and evaluation criteria.

#### 5.22.2 Modes

- **Practice mode:** Students can practice repeatedly with immediate feedback and scoring; no grade is recorded.
- **Assessment mode:** Student submissions are recorded, scored, and graded. Results appear in the gradebook.

#### 5.22.3 Technology and Provider Abstraction

The voice and pronunciation module operates through a provider abstraction layer. The platform does not depend on a specific vendor. Providers are stored behind an interface so vendors can be swapped without platform changes.

Example supported providers:

- Azure Speech Pronunciation Assessment
- Google Cloud Speech
- Deepgram
- AssemblyAI

The abstraction interface must support:

- Audio upload and streaming.
- Pronunciation assessment with scoring dimensions.
- Speech-to-text transcription.
- Provider-specific configuration per tenant.
- Failover between providers.
- Usage tracking and billing per tenant.

---

### 5.23 Automation

Support rules, scheduled jobs, and event-driven workflow automation.

- Rule-based triggers (e.g., if homework is 3 days overdue, notify parent).
- Scheduled jobs (e.g., send weekly progress summaries every Friday).
- Event-driven automation (e.g., on course enrollment, send welcome message and assign onboarding tasks).
- Workflow templates for common automation scenarios.

---

### 5.24 Content Portability

Content Portability is a dedicated subsystem for managing the lifecycle and distribution of educational content. It is separate from system backups and disaster recovery.

#### 5.25.1 Export

- **Course export:** Export complete course packages including structure, content, assessments, and rubrics.
- **Lesson export:** Export individual lessons or lesson groups.
- **Question bank export:** Export question banks with categories, tags, and metadata.
- **Curriculum export:** Export curriculum definitions and mappings.

Export formats should use a standardized, documented package format.

#### 5.25.2 Import

- **Course import:** Import course packages into a branch, with conflict resolution for existing content.
- **Question bank import:** Import question banks with merge and deduplication options.
- **Curriculum import:** Import curriculum definitions.
- **Validation:** Imported content is validated for completeness, format correctness, and compatibility before application.

#### 5.25.3 Synchronization and Cloning

- **Curriculum synchronization:** Synchronize curriculum updates across branches or organizations.
- **Cross-branch cloning:** Clone courses, lessons, and question banks across branches within an organization.
- **Marketplace publishing:** Publish content to the marketplace for acquisition by other organizations.

#### 5.25.4 Version History and Rollback

- **Version history:** Maintain a version history for courses, lessons, modules, and question banks.
- **Change tracking:** Record who changed what and when.
- **Rollback:** Revert content to a previous version with a single action.
- **Diff view:** Compare versions to see what changed.

---

### 5.25 Marketplace

Support future content and template distribution between organizations.

- Content listing and discovery.
- Pricing (free, paid, subscription).
- Reviews and ratings.
- Content preview.
- License management.
- Revenue sharing for content creators.
- Quality review process for published content.

### 5.26 Frontend Theming and Customization

Support per-organization visual customization of the client applications, across three tiers, all connected to the single shared backend/API (no per-organization backend):

- **Tier 1 — Token Theming [default, all tiers, no redeploy].** Organization Admin can configure logo, favicon/app icon, primary/secondary/accent colors, font family (from a supported set), and custom subdomain (`orgname.platform.com`). Applied at runtime via a design-token/theme configuration loaded per organization from the shared `apps/web` application; no separate codebase or deployment.
- **Tier 2 — Layout Variants [Pro/Chain and above, no redeploy].** Organization Admin can select from a curated set of pre-built layout and dashboard-arrangement variants, still served from the shared `apps/web` codebase via configuration.
- **Tier 3 — Dedicated Per-Organization Application [opt-in, any organization that needs it].** For organizations requiring bespoke UI beyond Tiers 1–2, provision a **separate, dedicated frontend application and deployment for that organization**, scaffolded from the platform's reference template and customized freely (custom pages, custom components, custom UX flows) while still consuming the platform's shared UI component library and API SDK as versioned packages — so the dedicated app keeps receiving core fixes and API-contract updates via package version bumps rather than manual re-implementation. Each Tier 3 organization app is deployed and hosted independently (its own build pipeline, its own domain/CDN target) but authenticates against the **same shared backend and API** as every other tenant — Tier 3 changes only the frontend delivery model, never the backend/data architecture. This must be a repeatable, tooled onboarding step (see 5.29), not a one-off bespoke rebuild each time.

Custom domain, logo, and color configuration must apply consistently across web, student/parent web portal, and mobile app (app icon and splash screen) surfaces for a given organization, regardless of tier.

### 5.27 Student and Parent Web Portal

Provide a dedicated web application for Student and Parent roles, functionally equivalent to the mobile apps for core workflows: dashboard/overview, course and lesson access, homework submission, grades and gradebook view, attendance view, schedule and exam calendar, messaging and announcements, notifications, and payments where enabled. Voice/pronunciation practice (5.22) must work via browser microphone access where the underlying speech provider supports web audio input. Offline support is not required for the web portal (offline behavior remains a mobile-specific requirement per Section 12); the web portal assumes an active connection. Tier 3 organizations (5.26) may deploy a dedicated build of this portal as well, under the same shared-package model.

### 5.28 Platform Super Admin Desktop Application

Provide a dedicated desktop application for the Platform Super Admin role, built and deployed as a **separate application from the customer-facing web/desktop app** used by Organization Admin, Branch Admin, Teacher, and Assistant Teacher roles — not a shared bundle with role-based hiding of admin routes.

Rationale: Platform Super Admin has cross-tenant access (all organizations' data, billing, and support tooling). Bundling that capability into the same build as the customer-facing product increases attack surface (internal routes/code shipped to every customer install) and risks accidental exposure through misconfigured permissions. A separate build keeps internal platform-management code out of any customer-facing artifact entirely.

Functional scope (superadmin capabilities, delivered through this dedicated app):
- Organization lifecycle management: create, suspend, cancel, archive; trial-to-paid conversion.
- Subscription/plan and feature-flag management per organization, without requiring a code deploy.
- Consolidated billing dashboard: MRR, churn, per-branch revenue, failed payments.
- Usage monitoring per organization (storage, video minutes, SMS/communication credits, AI/speech usage) for abuse detection and upsell signals.
- Impersonation/support mode with mandatory, non-deletable audit logging of every impersonation session.
- Global feature flags, maintenance banners, and system health/observability dashboards.

Access and distribution constraints:
- Distributed only through internal channels (not a public app-store listing and not linked from the customer-facing product or website).
- Login restricted to users holding the Platform Super Admin role at the backend; valid credentials for any other role must be rejected at this app's login, even if otherwise valid, as defense in depth.
- Mandatory MFA (not optional) for this application, independent of the general "MFA for privileged roles" baseline in 5.1.
- Session timeout and re-authentication requirements should be stricter than the customer-facing apps, given the scope of access.

### 5.29 Per-Organization App Provisioning and Maintenance

Support a repeatable internal workflow for provisioning a Tier 3 dedicated frontend application (5.26) for a new or existing organization:

- A scaffolding tool/script generates a new organization application from the reference template, pre-wired with the organization's tenant ID, API credentials, and starting theme configuration, so a new client app starts functional and only requires customization on top, not a rebuild from zero.
- Each provisioned organization application is tracked in an internal registry (organization, app version/package versions in use, deployment URL, last update date) so the platform team can see at a glance which organization apps exist and how current they are.
- Define and enforce a maximum allowable drift between an organization app's shared-package versions (`packages/ui`, `packages/sdk`, `packages/shared`) and the latest published versions, especially for security patches; organization apps exceeding the allowed drift must be flagged for update.
- Removing or offboarding an organization's dedicated app must not affect any other organization's app or the shared backend.

### 5.30 Unified Login with Role-Based Rendering

For every customer-facing application (`apps/web`, `apps/mobile`, `apps/desktop`, the student/parent web portal, and any Tier 3 dedicated organization app per 5.26) — explicitly **excluding** the Platform Super Admin desktop app (5.28), which remains single-role and isolated — implement a single login per application that resolves into a role-appropriate experience after authentication, rather than separate logins or separate apps per role. This follows the pattern used by products like Microsoft Teams (one login, workspace/org context resolved after sign-in) and Moodle (one login, dashboard and available actions determined by role within each course).

- After authentication, the application resolves the user's Membership(s) — the set of (organization, branch, role) combinations the account holds — and renders the dashboard, navigation, and available actions for the relevant role automatically. A Teacher sees teaching workflows; a Student sees learning workflows; a Branch Admin sees branch-management workflows; and so on, all from the same login screen and the same application build.
- If a user holds exactly one Membership, they land directly in that role's experience with no extra step.
- If a user holds multiple Memberships (e.g., a Teacher at one branch who is also a Parent of a student at another branch, or a Branch Admin for two branches), provide an in-app context switcher to move between them without a full re-login — consistent with how Teams switches between organizations or Slack switches workspaces. The most recently used context is remembered as the default on next login.
- Switching context must immediately re-scope the user's available data, navigation, and permissions to the newly selected Membership; no data or actions from a previous context should remain visible after switching.
- This requirement applies uniformly across web, mobile, desktop, and Tier 3 organization apps so that role-based behavior is consistent regardless of which client the user is on.

---

## 6. Non-Functional Requirements

### 6.1 Performance

Standard reads should target p95 under 300 ms. Media streaming should support adaptive bitrate delivery. Search queries should return results within 500 ms.

### 6.2 Scalability

Support hundreds of organizations and thousands of branches without architecture redesign. Support concurrent exam sessions with hundreds of students per branch. Media pipeline should scale horizontally.

### 6.3 Availability

At least 99.5 percent for standard tiers and 99.9 percent for enterprise tiers.

### 6.4 Security

TLS, encryption at rest, MFA for admins, audit logs, least-privilege access, virus scanning for uploads, anti-cheat measures, and fine-grained RBAC combined with ABAC.

### 6.5 Privacy

Protect minors' data and support export and deletion workflows where legally required. Comply with GDPR, FERPA, and other applicable regulations.

### 6.6 Reliability

Automated backups, recovery procedures, queue resilience, and media pipeline fault tolerance.

### 6.7 Accessibility

The platform shall conform to WCAG 2.1 AA requirements. Specific requirements include:

- **Keyboard navigation:** All interactive elements must be accessible via keyboard alone.
- **Screen readers:** All content and controls must be compatible with screen readers (ARIA labels, roles, and live regions).
- **Captions:** Video and audio content must support captions and transcripts.
- **Color contrast:** All text and interactive elements must meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
- **Accessible forms:** All form inputs must have associated labels, error messages, and keyboard-accessible controls.
- **Reduced motion:** Respect user preferences for reduced motion; provide alternatives to animations.
- **Font scaling:** The interface must remain usable when text is scaled up to 200%.
- **Focus indicators:** Visible focus indicators must be present on all interactive elements.
- **Alt text:** All informational images must have descriptive alt text.

### 6.8 Maintainability

Clear module boundaries and testable service layers. Content types and question types should be extensible via configuration, not code changes.

### 6.9 Extensibility

Feature flags, modular integrations, versioned APIs, plugin-style provider integrations, and API webhooks for third-party integrations.

### 6.10 Localization

Externalize strings and support at least English, Russian, and Uzbek.

### 6.11 Offline Support

Selected mobile flows must work when temporarily offline, including content viewing, homework drafting, attendance marking, and audio recording.

### 6.12 Disaster Recovery

Define recovery point and recovery time objectives for production environments. Content versioning and rollback are separate from disaster recovery (see section 5.25).

### 6.13 Competency and Learning Outcome Mapping

The platform must support mapping courses, lessons, assessments, and activities to defined competencies and learning outcomes. This mapping drives reporting (section 5.20.5).

### 6.14 Curriculum Versioning

Curricula must be versioned. Changes to a curriculum create a new version. Existing enrollments may continue on the previous version or be migrated. Version history and diff views are required.

### 6.15 Digital Certificates

Support digital certificate generation with unique identifiers, QR codes, branding, and public verification endpoints. Certificates must be tamper-evident and verifiable without platform access.

### 6.16 Feature and Module Licensing

Feature and module availability is controlled per tenant through licensing. The licensing system must support enabling/disabling individual modules, setting usage limits, and enforcing subscription tier restrictions.


### 6.17 Media Transcoding and Streaming

Support a media transcoding pipeline that converts uploaded media (video, audio, presentations) into streaming-optimized formats. Deliver media through CDN-backed endpoints with adaptive bitrate streaming for video.

### 6.18 Fine-Grained Access Control (RBAC + ABAC)

The platform must support both role-based access control (RBAC) and attribute-based access control (ABAC). RBAC defines permissions based on user roles. ABAC extends this with attribute-based policies (e.g., "teachers can only see students in their assigned classes," "branch admins can only access their branch data").

### 6.19 Full Audit Trails

Maintain full audit trails for all academic and administrative actions including grade changes, permission changes, content modifications, enrollment changes, assessment access, and administrative operations. Audit records must include timestamp, actor, action, target, previous value, new value, and IP address.

### 6.20 Advanced Search

Provide advanced search across all academic content including courses, lessons, questions, discussions, resources, and student records. Support full-text search, faceted filtering, and tenant-scoped results.

---

## 7. Business Rules

- **Student:** Belongs to one or more enrollments and may be linked to one or more parents.
- **Enrollment:** A student belongs to a class, group, or cohort within a branch.
- **Transfer:** Moving a student between branches must preserve audit history and grade records.
- **Graduation:** Completion status must be recorded and preserved.
- **Payments:** Only enabled for organizations or branches with billing features.
- **Attendance:** Attendance records must be immutable except through audited correction flows.
- **Homework:** Grading and feedback changes must be tracked with full history.
- **Certificates:** Generated certificates and report cards must be branded per organization.
- **Permissions:** Assistant teacher permissions must be configurable per organization using granular capabilities.
- **Subscription:** Branch subscription state controls module availability.
- **Billing:** Invoices and credits must reflect active modules and usage limits.
- **LMS Completion:** Completion status changes are irreversible except through audited administrative action. Prerequisites are enforced server-side and cannot be bypassed by client manipulation.
- **Assessment Integrity:** Anti-cheat violations are logged and cannot be retroactively removed. Exam attempts cannot be restarted after submission except through audited administrative override.
- **Gradebook Audit:** All grade entries and modifications are recorded with actor, timestamp, old value, new value, and reason. Grade deletions require admin approval.
- **Content Portability:** Imported content must pass validation before it is applied. Content versions are immutable once published.
- **Gamification:** XP and badge awards are logged and auditable. Leaderboard calculations must be consistent and verifiable.
- **Voice Submissions:** Audio recordings submitted for assessment are immutable. Pronunciation scores are recorded with provider, model version, and scoring parameters.
- **Frontend Theming:** Tier 1 and Tier 2 theming changes apply immediately at runtime with no deployment. Tier 3 custom builds are a separate, individually contracted engagement and are not covered by standard subscription SLAs.

---

## 8. Domain Model

### 8.1 Core Entities

Organization, Branch, User, Membership, Role, Permission, Class, Group, Enrollment, ParentLink, Subscription, FeatureFlag, AuditLog, ThemeConfig.

### 8.2 LMS Entities

Subject, Program, Course, Level, Curriculum, CurriculumVersion, Module, Section, Lesson, Unit, Topic, ContentBlock, ContentType, CourseTemplate, CourseFormat, Prerequisite, CompletionRecord, ReusableBlock.

### 8.3 Assessment Entities

QuestionBank, QuestionCategory, Question, QuestionTag, QuestionType, QuestionVersion, Quiz, QuizConfiguration, QuizAttempt, QuizResponse, GradingRubric, RubricCriterion, AntiCheatLog, AntiCheatConfiguration.

### 8.4 Gradebook Entities

GradebookEntry, GradeCategory, GradeWeight, GradeScale, GradeScaleMapping, GradeHistory, GradeApproval, ReportCard, Transcript.

### 8.5 Groups and Cohorts Entities

Group, Subgroup, ProjectGroup, Cohort, GroupMembership, EnrollmentRule.

### 8.6 Collaboration Entities

Announcement, DiscussionForum, Thread, Post, Comment, Reaction, QAQuestion, QAAnswer, OfficeHoursSlot, OfficeHoursBooking.

### 8.7 Gamification Entities

Badge, BadgeAward, Achievement, AchievementProgress, XPRecord, PointRecord, Leaderboard, LeaderboardEntry, Streak, LearningChallenge, Certificate, CertificateTemplate, Reward, ParentReward.

### 8.8 Voice and Pronunciation Entities

SpeechRecording, PronunciationResult, PronunciationScore, SpeechProvider, SpeechProviderConfiguration, SpeakingAssignment, OralExam.

### 8.9 Content Portability Entities

ContentPackage, ExportJob, ImportJob, ImportValidation, ContentVersion, ContentDiff, MarketplaceListing.


### 8.10 Supporting Entities

Notification, NotificationTemplate, NotificationDelivery, Invoice, Payment, PaymentReminder, Lead, Inquiry, Schedule, Room, Resource, CalendarSync, Webhook, WebhookDelivery, SearchIndex.

### 8.11 Relationships

- Organization owns many Branches.
- Branch owns many Classes, Users through Memberships, and operational records.
- Users gain permissions through Memberships, Roles, and attribute-based policies.
- Classes connect Teachers, Students, Homework, Assessments, and Attendance.
- Courses contain Modules, which contain Sections, which contain Lessons.
- Lessons contain Content Blocks of various Content Types.
- Questions belong to Question Banks and are tagged with Categories, Tags, Difficulty, and Learning Outcomes.
- Quizzes draw from Question Banks and produce Attempts with Responses.
- Gradebook Entries link to Assessments, Homework, and Categories with Weights.
- Groups and Cohorts contain Students through Memberships.
- Discussions, Threads, and Posts belong to Courses or Classes.
- Badges and Achievements are awarded to Users and recorded as Awards.
- Speech Recordings link to Pronunciation Results and Speaking Assignments.
- Content Packages wrap Courses, Lessons, and Question Banks for export/import.

- AuditLog records security, data, grade, and content changes.

---

## 9. Database Specification

Use a shared schema with tenant-scoped tables and row-level security.

- Every mutable business table should include organization_id and, where applicable, branch_id.
- Use soft deletes for user-facing records where legal and audit requirements allow it.
- Maintain audit tables for sensitive actions such as grade edits, permission changes, deletions, impersonation, content modifications, and assessment access.
- Indexes must cover tenant filters, foreign keys, common lookup paths, and search fields.
- Question bank tables must support efficient querying by category, tags, difficulty, subject, and learning outcome.
- Content version tables must support efficient diffing and rollback.
- Gamification tables must support efficient leaderboard queries with ranking.
- Voice and pronunciation tables must store audio references, scoring data, and provider metadata.
- Media tables must track transcoding status, delivery URLs, and CDN configurations.

---

## 10. API Specification

Use versioned REST endpoints under /api/v1.

- All requests must derive tenant scope from the authenticated session or token, never from unvalidated client input.
- Responses should use consistent error envelopes and validation messages.

- Assessment endpoints must enforce anti-cheat rules server-side.
- Content portability endpoints must support large file uploads and downloads with progress tracking.
- Webhook endpoints must support registration, testing, and delivery status querying.
- Provide comprehensive API documentation with OpenAPI/Swagger specification.

---

## 11. UI Requirements

- Provide responsive web interfaces for platform, organization, branch, teacher, and assistant teacher workflows.
- Provide a dedicated student and parent web portal covering the same core workflows as the mobile apps (dashboard, homework, grades, attendance, schedule, messaging, payments where enabled), in addition to mobile-first interfaces for those roles.
- Include empty states, loading states, error states, and accessible form behavior.
- White-label branding must apply to logo, colors, and supported identity surfaces, applied at runtime per organization without requiring a separate build or code change (see 5.26, Frontend Theming and Customization).
- Support drag-and-drop interfaces for course structure management, question ordering, and content block arrangement.
- Assessment interfaces must support all question types with appropriate input controls.
- Gradebook interfaces must support bulk entry, inline editing, and filtering.
- Collaboration interfaces must support threaded discussions, reactions, and real-time updates.
- Gamification elements (badges, XP, streaks) must be visible in student dashboards, on both web and mobile.
- Voice recording interfaces must include audio visualization, playback, and re-recording controls, on both web (browser microphone) and mobile.
- All interfaces must conform to WCAG 2.1 AA requirements (see section 6.7).

---

## 12. Mobile Specification

Mobile apps are required for staff as companion apps and are the primary day-to-day interface for students and parents, alongside an equivalent web portal (11) for browser/desktop use. Mobile and web share the same backend contracts (2.7) so feature parity is maintained by default; any deliberate mobile-only or web-only feature must be explicitly justified (e.g., offline queueing is mobile-specific by nature).

- Support push notifications, download access for selected content, offline queueing for submissions where feasible, and deep links into lessons, homework, messages, and assessments.
- Support voice recording and playback for pronunciation practice and speaking assignments.
- Support camera access for document scanning, image submission, and optional webcam proctoring.
- Support offline content viewing for downloaded lessons and materials.
- Support offline homework drafting with sync on reconnection.
- Gamification elements (badges, streaks, leaderboard) must be prominently featured in the student mobile experience.
- Assessment interfaces must support all question types with touch-optimized controls.

---

## 13. Security

- Authentication, authorization, JWT, refresh tokens, MFA, encryption at rest and in transit, rate limiting, OWASP controls, audit logs, data isolation, secrets management, virus scanning for uploads, and backups are mandatory.
- Fine-grained RBAC combined with ABAC must be enforced at the API layer.
- Assessment anti-cheat measures must be enforced server-side (see section 5.8.5).
- Pluggable identity providers must be supported: SSO, LDAP, SAML, and OAuth.
- Content portability operations must enforce cross-tenant permission checks.
- Voice recordings and media uploads must be scanned for malicious content.
- Full audit trails must be maintained for all security-sensitive operations (see section 6.19).

---

## 14. DevOps

- Development, testing, staging, and production environments must be separated.
- Use containers, automated pipelines, logging, monitoring, rollback support, and infrastructure as code.
- Media transcoding pipeline must be independently scalable.

- Search infrastructure must be monitored for index freshness and query performance.

---

## 15. Testing

Test coverage must include unit, integration, E2E, performance, security, load, penetration, and user acceptance testing.

Additional test requirements:

- Tenant isolation tests.

- Assessment engine tests covering all question types, grading modes, and anti-cheat scenarios.
- Gradebook calculation tests with weighted categories and grade scale conversions.
- Content portability tests covering export, import, validation, and version rollback.
- Voice and pronunciation tests covering recording, scoring, and provider abstraction.
- Gamification tests covering XP calculation, badge award rules, and leaderboard ranking.
- Accessibility tests covering WCAG 2.1 AA compliance.
- Calendar synchronization tests.
- Webhook delivery tests.

---

## 16. Deployment

- Support local, development, staging, and production deployment targets.
- Production deployment must support rollback and disaster recovery procedures.
- Media pipeline and search infrastructure may have independent deployment lifecycles.


---

## 17. Roadmap

- **MVP:** Auth, tenancy, core academic workflows (LMS basics, homework, basic assessments), attendance, messaging, and manual operations.
- **V1:** Module gating, branch management, basic analytics, gradebook, groups and cohorts, collaboration basics, and content types expansion.
- **V2:** Full assessment engine with anti-cheat, advanced reporting, voice and pronunciation, and content portability.
- **Enterprise:** White-label, billing, integrations, advanced automation, RBAC+ABAC, SSO/LDAP/SAML, calendar sync, digital certificates, webhooks, and advanced search.
- **Gamification:** Badges, XP, leaderboards, streaks, challenges, and certificates (optional module, any phase).
- **Marketplace:** Shared content and template ecosystem, marketplace publishing, revenue sharing.

---

## 18. Risks

- **Technical:** Tenant isolation bugs, scaling bottlenecks, media pipeline failures, search index staleness, and speech provider accuracy variance.
- **Business:** Weak onboarding, weak retention, pricing mismatch, domain-specific feature gaps, and marketplace content quality.
- **Security:** Minors' data exposure, permission errors, account takeover, and assessment cheating.
- **Legal:** Privacy compliance (GDPR, FERPA), payment compliance, and certificate authenticity.
- **Operational:** Support complexity, import quality and validation failures, messaging delivery failures, voice provider billing, and gamification balance issues.

---

## 19. Appendices

- Glossary.
- Permission Matrix.
- Feature Matrix.
- Architecture Decision Records.
- ER Diagrams.
- Wireframes.
- Sequence Diagrams.
- State Diagrams.
- Question Type Catalog (all supported question types with specifications and examples).
- Content Type Catalog (all supported content types with specifications and rendering requirements).
- Grade Scale Reference (all supported grade scales with conversion tables).
- Anti-Cheat Configuration Reference (all anti-cheat measures with configuration options and detection thresholds).
- Content Package Format Specification (export/import package structure and validation rules).
- Voice Provider Integration Specification (provider abstraction interface and configuration reference).
- Webhook Event Catalog (all webhook events with payload specifications).
- Accessibility Compliance Checklist (WCAG 2.1 AA requirements mapped to platform features).
- Supported Domain Reference (all supported educational domains with domain-specific considerations).

---

## 20. Implementation Gap Register

This section formally records requirements identified during implementation review that were under-specified, missing, or need explicit enforcement language added to an earlier section. Each entry is assigned a **Gap ID** and a **Priority** (Critical / High / Medium). Entries here are normative: they carry the same weight as the section they amend.

---

### 20.1 Authentication & Identity (amends §5.1)

**GAP-AUTH-01 — MFA Endpoints (Critical)**
The authentication API MUST expose the following endpoints in addition to `login`, `register`, `refresh`, and `logout`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/mfa/setup` | POST | Initiate TOTP or SMS MFA enrollment; returns provisioning URI and backup codes. |
| `/auth/mfa/verify` | POST | Validate a TOTP code or SMS OTP during the login challenge step. |
| `/auth/mfa/disable` | POST | Disable MFA with re-authentication (current password required). |
| `/auth/forgot-password` | POST | Issue a time-limited password reset token delivered via email. |
| `/auth/reset-password` | POST | Accept reset token and new password; invalidates all active sessions. |
| `/auth/invite/accept` | POST | Accept a workspace invitation token, set password, and complete registration. |
| `/auth/sso/:provider` | GET | Initiate OAuth 2.0 / SAML redirect to the configured identity provider. |
| `/auth/sso/:provider/callback` | GET/POST | Handle provider callback; exchange code for internal JWT. |

**GAP-AUTH-02 — Mandatory MFA for Privileged Roles (Critical)**
The system MUST enforce mandatory TOTP MFA (no SMS-only option) for the `platform_super_admin` role and MUST enforce at least one MFA method for `org_admin` and `branch_admin` roles when operating on production tenants. MFA enforcement MUST be checked server-side on every access-token issuance; a client-side bypass MUST NOT be trusted as sole enforcement.

**GAP-AUTH-03 — Platform Super Admin Login Isolation (Critical)**
The `apps/admin-desktop` application MUST be the only client allowed to exchange credentials for a `platform_super_admin`-scoped JWT. The backend MUST validate an additional `client_id` claim or a dedicated `/platform/v1/auth/login` endpoint that rejects tokens for any role other than `platform_super_admin`. Standard tenant-facing `/api/v1/auth/login` MUST NOT issue `platform_super_admin` tokens regardless of role in the database.

---

### 20.2 Security — Tenant Isolation (amends §3.3, §6)

**GAP-SEC-01 — PostgreSQL Row-Level Security Policies (Critical)**
In addition to application-layer `organization_id` filtering, every multi-tenant table (any table that carries an `organization_id` column) MUST have a corresponding PostgreSQL RLS policy defined in a versioned database migration. The policies MUST be enabled via `ALTER TABLE … ENABLE ROW LEVEL SECURITY` and MUST be applied before any production data is written. A TypeORM migration file named `YYYYMMDD_rls_policies.ts` MUST be present in `apps/backend/src/migrations/` and MUST be executed as part of the standard deployment pipeline.

**GAP-SEC-02 — Super-Admin Routes Must Not Ship in Customer Builds (Critical)**
No route, component, guard, or service belonging to the Platform Super Admin surface (`/admin`, `/admin/**`, `/platform/v1/**`) MAY exist in the `apps/web`, `apps/mobile`, or `apps/desktop` build outputs. This MUST be enforced by a CI lint step that fails the build if any of those path patterns are referenced from within a customer-facing app entry point.

---

### 20.3 Database & Migrations (amends §7, §14)

**GAP-DB-01 — Versioned TypeORM Migrations (Critical)**
The project MUST use TypeORM's migration runner (not `synchronize: true`) in staging and production environments. A `typeorm.config.ts` CLI-compatible data source configuration MUST exist in `apps/backend/`. All schema changes MUST be delivered as timestamped migration files in `apps/backend/src/migrations/`. The `synchronize: true` flag MAY only be enabled when `NODE_ENV === 'development'`.

**GAP-DB-02 — Database Seeder (High)**
A seed script (`npm run seed` or `pnpm seed`) MUST be available that creates:
- One `platform_super_admin` user with TOTP MFA pre-configured.
- One sample organization with two branches, demo courses, and a teacher + student + parent account set.
- The full system role/permission bootstrap (all `SystemRole` values from `packages/shared/src/constants/roles.ts` seeded into the `roles` and `permissions` tables with their default permission mappings).

---

### 20.4 Backend Services — Required Implementation Completeness (amends §5)

The following service responsibilities are currently defined in the SDD (§3.2.x) but have no confirmed implementation. Each constitutes an incomplete requirement.

**GAP-SVC-01 — Assessment Engine State Machine (Critical)**
`QuizDeliveryService` MUST implement a server-side state machine for quiz attempts with states: `not_started → in_progress → submitted → graded`. Time enforcement MUST be server-side: the server MUST record `startTime` on attempt creation and MUST auto-submit (`QuizAttemptAutoSubmitted` event) when `startTime + timeLimit` is exceeded, regardless of client state.

**GAP-SVC-02 — Gradebook Calculation Engine (High)**
`GradeCalculationService` MUST implement weighted category averaging, running-total calculation, and projected-final-grade calculation per the formula: `finalGrade = Σ (categoryWeight × categoryAverage)`. Grade scale conversion MUST support all `GradeScaleType` values from `packages/shared/src/constants/content-types.ts`.

**GAP-SVC-03 — LMS Completion Propagation (High)**
`CompletionService` MUST implement bottom-up completion propagation: when all lessons in a module are marked complete, the module MUST be automatically marked complete; when all modules in a course are complete, the course MUST be marked complete and a `CourseCompleted` event MUST be emitted to trigger gamification and certificate flows.

**GAP-SVC-04 — Gamification Event Wiring (High)**
The `GamificationModule` MUST register event listeners for the following events published by other modules: `LessonCompleted`, `HomeworkSubmitted`, `QuizAttemptSubmitted`, `AttendanceRecorded` (status=present), `CourseCompleted`, `QAAnswerAccepted`. Each listener MUST update XP, evaluate badge award conditions, and update streak counters.

**GAP-SVC-05 — Voice Module Provider Adapter (High)**
`VoiceModule` MUST implement a provider-abstraction interface (`IVoiceProvider`) with at minimum one concrete adapter (Azure Cognitive Services Speech or Deepgram). Audio recordings MUST be uploaded to the storage module before scoring is dispatched to the provider. Scoring results MUST be stored as `PronunciationResult` entities.

**GAP-SVC-06 — Notification Delivery Pipeline (High)**
`NotificationsModule` MUST implement multi-channel delivery: in-app (WebSocket push), email (SMTP/SendGrid), push notification (FCM for Android, APNs for iOS via Expo), and optionally SMS (Twilio). Each notification MUST be rendered from a template stored in the `notification_templates` table. Delivery failures MUST be retried via BullMQ with exponential backoff (max 5 attempts).

**GAP-SVC-07 — WebSocket Gateway (High)**
A NestJS `WebSocketGateway` MUST be created as a shared gateway used by: real-time messaging (§5.14), discussion thread live updates (§5.11), live quiz anti-cheat monitoring (§5.8.5), and in-app notification delivery (§5.15). The gateway MUST authenticate connections using the same JWT strategy used by HTTP endpoints and MUST scope socket rooms by `organization_id` and `branch_id` to prevent cross-tenant message leakage.

**GAP-SVC-08 — Webhook Delivery Queue (Medium)**
`WebhooksModule` MUST implement a BullMQ-backed delivery queue. Each webhook event MUST be delivered with an HMAC-SHA256 signature header (`X-CampusOS-Signature`). Failed deliveries MUST be retried with exponential backoff and a maximum of 7 attempts. Delivery outcomes MUST be stored in a `webhook_delivery_log` table.

**GAP-SVC-09 — Search Index Synchronization (Medium)**
`SearchModule` MUST synchronize content from PostgreSQL to OpenSearch. Synchronization MUST be event-driven: domain events (e.g., `CourseCreated`, `CoursePublished`, `LessonCreated`, `UserCreated`) MUST trigger index upserts via BullMQ workers. A full re-index CLI command MUST be available for disaster recovery.

**GAP-SVC-10 — Media Transcoding Workers (Medium)**
`MediaModule` MUST implement BullMQ workers that invoke FFmpeg for video transcoding to HLS format (minimum: 360p, 720p, 1080p renditions). Transcoded assets MUST be uploaded to the configured object storage (S3/MinIO). The original upload MUST be preserved. `MediaModule` MUST expose a `transcodingStatus` endpoint polled by the client until a `MediaReady` event is emitted.

---

### 20.5 RBAC — Permission Seeding & ABAC Policies (amends §5.24)

**GAP-RBAC-01 — System Role Seed (High)**
All roles defined in `packages/shared/src/constants/roles.ts` (`SystemRole` enum) MUST be seeded into the `roles` table on first startup or via the database seeder. The `DEFAULT_ROLE_PERMISSIONS` map MUST be used to seed the `permissions` and `role_permissions` tables. Seeding MUST be idempotent (safe to run multiple times).

**GAP-RBAC-02 — ABAC Policy Enforcement (High)**
The `ABACService` MUST evaluate the following attribute-based policies before any service-layer data access is permitted:
1. Teachers MUST only access students who are members of at least one class the teacher is assigned to.
2. Branch Admins MUST only access data where `resource.branchId === user.branchId`.
3. Parents MUST only access grade, attendance, and message data for students they are linked to via a `ParentLink` record.

---

### 20.6 Frontend — Missing Pages & Applications (amends §5)

**GAP-FE-01 — Student/Parent Web Portal (Critical)**
A dedicated web application `apps/web-portal` MUST be created for the Student and Parent roles. It MUST be functionally separate from the staff/admin `apps/web` application, though it MAY share components from `packages/ui`. Minimum pages:

| Page | Role | SRS Ref |
|------|------|---------|
| Dashboard | Student, Parent | §5.27 |
| My Courses / Lesson Viewer | Student | §5.7 |
| Homework Submission | Student | §5.9 |
| Grades View | Student, Parent | §5.19, §5.27 |
| Attendance View | Student, Parent | §5.12, §5.27 |
| Schedule | Student | §5.13 |
| Messaging | Student, Parent | §5.14 |
| Payments | Parent | §5.16 |
| Voice Practice | Student | §5.22 |

**GAP-FE-02 — Missing Staff/Admin Web Pages (High)**
The following pages MUST be implemented in `apps/web` for staff and admin roles:

| Page | Role(s) | SRS Ref |
|------|---------|---------|
| Assessment — quiz/exam taking UI | Student (via portal) | §5.8 |
| Schedule & Calendar | Teacher, Admin | §5.13 |
| Notifications Center | All roles | §5.15 |
| Payments & Invoices | Parent, Admin | §5.16 |
| Groups & Cohorts | Admin, Teacher | §5.10 |
| Student Gamification Dashboard | Student | §5.21 |
| Voice Practice Interface | Student | §5.22 |
| Reporting & Analytics | Admin, Branch Admin | §5.20 |
| Branch Management | Org Admin | §5.3 |
| CRM / Lead Pipeline | Admin | §5.17 |
| User Profile & Settings | All roles | §5.4–5.6 |

**GAP-FE-03 — Admin Desktop Missing Capabilities (High)**
The Platform Super Admin desktop application (`apps/admin-desktop`) MUST implement the following capabilities not yet present:

| Capability | SRS Ref |
|-----------|---------|
| Organization creation (trial provisioning) | §5.28 |
| Trial-to-paid conversion flow | §5.28 |
| Consolidated billing dashboard: MRR, churn rate, failed payments, per-branch revenue | §5.28 |
| Per-organization usage monitoring: storage used, video minutes consumed, AI/speech credits used | §5.28 |
| Global maintenance banner delivery (not just a flag — a WebSocket push to all connected clients) | §5.28 |
| Mandatory TOTP MFA challenge in the login flow (not optional) | §5.28, GAP-AUTH-02 |

---

### 20.7 Shared Packages (amends §5.26, §5.29)

**GAP-PKG-01 — `packages/ui` Component Library (High)**
A shared UI component library MUST be created at `packages/ui/`. It MUST export all primitive components (Button, Input, Select, Badge, Card, Table, Modal, Toast, Avatar, Spinner, Toggle, LanguageSwitcher, Sidebar, Topbar). All components MUST use CSS custom properties from a shared design-token file (`packages/ui/src/tokens.css`) and MUST NOT hardcode color or spacing values. This library MUST be consumed by `apps/web`, `apps/web-portal`, `apps/admin-desktop`, and all Tier 3 `apps/orgs/{slug}` applications.

**GAP-PKG-02 — `packages/sdk` API Client (Medium)**
A typed API client SDK MUST be created at `packages/sdk/`. It MUST expose typed functions for every endpoint in the `api/v1` and `platform/v1` namespaces (generated from OpenAPI spec or hand-authored). `apps/web`, `apps/web-portal`, `apps/admin-desktop`, and Tier 3 org apps MUST use this SDK for all backend calls; raw `fetch()` calls to backend endpoints MUST NOT appear in application code.

---

### 20.8 DevOps — Gaps (amends §14)

**GAP-OPS-01 — CI/CD Pipeline Files (High)**
`.github/workflows/` MUST contain the following workflow files:

| File | Trigger | Purpose |
|------|---------|---------|
| `ci.yml` | PR to `main` / `develop` | Lint, type-check, unit tests, coverage threshold (≥80%) |
| `integration.yml` | Merge to `main` | Integration tests against a real PostgreSQL + Redis Docker stack |
| `build.yml` | Tag push `v*.*.*` | Docker image build + push to container registry |
| `deploy-staging.yml` | Merge to `main` | Auto-deploy to staging environment |
| `deploy-production.yml` | Manual trigger with approval | Production deployment with smoke test |
| `drift-check.yml` | Cron: weekly | Check Tier 3 org app package versions against latest `packages/ui` and `packages/sdk` |

**GAP-OPS-02 — Local Docker Compose Full Stack (Medium)**
`docker-compose.yml` at the repo root MUST define services for: `postgres`, `redis`, `opensearch`, `minio` (S3-compatible), `mailhog` (SMTP), `backend`, `web`, `web-portal`. A `docker-compose.override.yml` MAY provide dev-time volume mounts. A `make up` or `pnpm docker:up` command MUST start the full stack with a single command.

**GAP-OPS-03 — Structured Logging (Medium)**
The backend MUST use structured JSON logging (Winston or Pino) instead of `console.log`. Every log line MUST include: `timestamp`, `level`, `service`, `traceId`, `organizationId` (when in a tenant request context), `userId` (when authenticated), and `message`. The `traceId` MUST correlate with the OpenTelemetry trace ID for the same request.

**GAP-OPS-04 — OpenTelemetry Instrumentation (Medium)**
`apps/backend/src/main.ts` MUST initialize an OpenTelemetry SDK (`@opentelemetry/sdk-node`) before the NestJS bootstrap. Traces MUST be exported to an OTLP endpoint (Jaeger/Tempo in development, AWS X-Ray or Grafana Tempo in production). Metrics MUST be exposed on a `/metrics` endpoint in Prometheus format. The following must be auto-instrumented: HTTP requests, PostgreSQL queries (TypeORM), Redis operations, BullMQ job execution.

---

### 20.9 Testing — Gaps (amends §15)

**GAP-TEST-01 — Tenant Isolation Test Suite (Critical)**
A dedicated integration test suite MUST verify that no API endpoint leaks data across tenant boundaries. The suite MUST:
1. Create two separate organizations (Org A, Org B) with identical data structures.
2. Authenticate as a user from Org A.
3. Attempt to access every resource type belonging to Org B via direct UUID references.
4. Assert that every such request returns HTTP 403 or 404.

**GAP-TEST-02 — Auth Flow Coverage (Critical)**
Unit and integration tests MUST cover: registration, login, refresh, logout, MFA setup, MFA verify (correct code), MFA verify (incorrect code — lockout after N attempts), password reset (valid token), password reset (expired token), invitation acceptance, SSO redirect, and SSO callback.

**GAP-TEST-03 — Assessment Engine Tests (High)**
Tests MUST cover: attempt state transitions, server-side time enforcement (auto-submit on time expiry), auto-grading for each `QuestionType`, partial credit, anti-cheat violation logging, and manual grading workflow state machine.

**GAP-TEST-04 — Gradebook Calculation Tests (High)**
Tests MUST cover: weighted category average with 100% total weight, weighted category average where weights do not sum to 100% (partial weight mode), grade scale conversion for each `GradeScaleType`, and projected final grade with missing scores.

**GAP-TEST-05 — WebSocket Isolation Tests (High)**
Tests MUST verify that WebSocket rooms are scoped by `organization_id`: a socket authenticated for Org A MUST NOT receive events emitted to an Org B room, even when the room name is guessable.

---

### 20.10 Mobile App — Required Features (amends §12)

**GAP-MOB-01 — Offline Content Caching (High)**
The mobile app MUST cache lesson content (text, PDFs, images) for offline viewing using a local SQLite database (via `expo-sqlite`) or a persistent cache library (e.g., MMKV). Students MUST be able to read previously downloaded lessons without a network connection.

**GAP-MOB-02 — Push Notifications (High)**
The mobile app MUST register for and receive push notifications via Expo Push Notification service (which delegates to FCM for Android and APNs for iOS). Notification categories: new message, grade posted, homework assigned, attendance recorded, quiz available.

**GAP-MOB-03 — Voice Recording UI (High)**
The mobile app MUST expose a voice recording interface using `expo-av` that captures audio, displays a recording waveform, and uploads the recording to the backend `VoiceModule` for scoring. Microphone permission MUST be requested following platform-specific guidelines.

**GAP-MOB-04 — Deep Links (Medium)**
The mobile app MUST handle universal links / app links for the following URL patterns: lesson viewer, homework submission, quiz attempt, grade view, and messaging thread. Deep link handling MUST authenticate the user and navigate to the target screen after the auth flow completes if the user is not already logged in.