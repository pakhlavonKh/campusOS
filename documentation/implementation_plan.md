# CampusOS — Implementation Plan

## Overview

Build the **CampusOS** platform — a multi-tenant, subject-agnostic education SaaS — based on the [SRS v2.0](file:///d:/projects/CampusOS-blueprint/documentation/SRS.md) and [SDD v1.0](file:///d:/projects/CampusOS-blueprint/documentation/02-Architecture/SDD.md). The system is a **modular monolith** with NestJS (backend), React + Vite (web), React Native (mobile), and Electron (desktop).

> [!IMPORTANT]
> This is an enormous enterprise platform with **24 modules**, **100+ database tables**, and **4 client applications**. Building it all at once is infeasible in a single session. This plan proposes a **phased approach** aligned with the SRS §17 Roadmap, starting with the **MVP scope**.

---

## User Review Required

> [!IMPORTANT]
> **Scope Decision**: The full CampusOS system (SRS §1–§19) encompasses ~24 backend modules, a React web app, React Native mobile, Electron desktop, infrastructure (Terraform, K8s), and CI/CD. Please confirm which **phase** you'd like me to build first:
>
> - **Phase 1 (MVP)**: Monorepo scaffold + Core modules (Auth, Users, Organizations, Branches, RBAC) + LMS basics (Courses, Modules, Lessons, Content Blocks, Homework) + Attendance + Messaging + Notifications
> - **Phase 2 (V1)**: Module gating, Gradebook, Groups & Cohorts, Collaboration, expanded content types, basic Analytics
> - **Phase 3 (V2)**: Full Assessment Engine with anti-cheat, Voice & Pronunciation, Content Portability, advanced Reporting
> - **Phase 4 (Enterprise)**: White-label, Billing/Payments, CRM, Finance, Website Builder, Marketplace, Automation, Gamification, Webhooks, SSO/LDAP/SAML, Calendar sync, Digital certificates, advanced Search

> [!WARNING]
> **Frontend vs Backend**: Should I focus on **backend only** first (NestJS API), **full-stack** (backend + React web), or **backend + web + mobile** simultaneously? The SDD recommends starting backend-first with API contracts.

> [!IMPORTANT]
> **Database**: The SDD specifies PostgreSQL 16+. Do you have a local PostgreSQL instance running, or should I include Docker Compose setup for local development?

---

## Open Questions

1. **Environment**: Do you already have Node.js 20+, pnpm, and Docker installed? This affects how we bootstrap the project.
2. **Deployment Target**: For now, should I set up Docker Compose only (local dev) or also include basic CI/CD (GitHub Actions)?
3. **Auth Provider**: The SRS lists SSO/LDAP/SAML as enterprise features. For MVP, should we start with email+password + JWT only?
4. **Database Seeding**: Should I create seed data for testing (sample organizations, branches, users, courses)?

---

## Proposed Architecture

Based on SDD §1.3, §2, and §21:

```
campusos/
├── apps/
│   ├── backend/          # NestJS modular monolith (24 modules)
│   ├── web/              # React + Vite + TypeScript web app
│   ├── mobile/           # React Native (future phase)
│   └── desktop/          # Electron wrapper (future phase)
├── packages/
│   ├── shared/           # Shared TypeScript types, constants, validators
│   ├── ui/               # Shared UI component library (future)
│   ├── sdk/              # Generated API SDK (future)
│   └── config/           # Shared ESLint, TSConfig, Prettier, Jest
├── infrastructure/
│   ├── docker/           # Docker Compose for local dev
│   ├── kubernetes/       # K8s manifests (future)
│   └── terraform/        # IaC (future)
├── scripts/              # Dev scripts (setup, seed, migrate)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## Proposed Changes — Phase 1 (MVP)

### 1. Monorepo Foundation

#### [NEW] Root workspace files
- `package.json` — pnpm workspace root
- `pnpm-workspace.yaml` — workspace package definitions
- `turbo.json` — Turborepo build pipeline (build, test, lint, dev)
- `.gitignore`, `.prettierrc`, `.eslintrc.js`, `.env.example`

#### [NEW] `packages/config/` — Shared configuration
- `eslint/` — Base ESLint config
- `tsconfig/` — Base TypeScript configs (base, node, react)
- `prettier/` — Prettier config
- `jest/` — Base Jest config

#### [NEW] `packages/shared/` — Shared types
- `src/types/` — Auth, User, Course, Assessment, API, Event types
- `src/constants/` — Roles, Permissions, Content Types, Question Types, Grade Scales
- `src/validators/` — Common validators
- `src/utils/` — Date, formatting utilities

---

### 2. Backend Application (`apps/backend/`)

#### [NEW] NestJS Application Scaffold
- `src/main.ts` — Bootstrap with global pipes, filters, interceptors
- `src/app.module.ts` — Root module importing all feature modules
- `src/config/` — Database, Redis, S3, JWT, BullMQ, App configurations
- `src/database/` — TypeORM config, migrations directory, seeds directory

#### [NEW] `src/common/` — Shared Backend Infrastructure
- `decorators/` — `@Permissions`, `@FeatureFlags`, `@Tenant`, `@Audit`
- `guards/` — JwtAuth, RBAC, ABAC, FeatureFlag, Tenant guards
- `interceptors/` — Logging, Transform, Timeout, Audit interceptors
- `pipes/` — Validation pipe
- `filters/` — HttpException, AllExceptions filters
- `middleware/` — Tenant, RateLimit, CorrelationId middleware
- `constants/` — Error codes, defaults
- `utils/` — Pagination, hashing, date utilities

#### [NEW] `src/shared/` — Shared Module
- `events/` — `DomainEvent` base class, `EventBusService`
- `entities/` — `BaseEntity` with standard columns (id, org_id, timestamps, soft delete)
- `repositories/` — `BaseRepository` with tenant-scoped queries
- `dto/` — Pagination, base response DTOs

---

### 3. Core Modules (MVP)

#### [NEW] `src/modules/auth/` — Authentication Module
- **Entities**: AuthCredential, RefreshToken, MFAConfig, AuthSession, Invitation, LoginAttempt
- **Services**: AuthService, TokenService, MFAService, InvitationService, SessionService
- **Controllers**: AuthController (login, register, refresh, logout, forgot-password, invite)
- **Events**: UserLoggedIn, UserRegistered, PasswordChanged, SessionRevoked, etc.
- **Guards**: JWT strategy (Passport.js), local strategy

#### [NEW] `src/modules/users/` — Users Module
- **Entities**: User, UserProfile, Membership, ParentLink, TeacherAssignment
- **Services**: UserService, MembershipService, ParentLinkService, TeacherAssignmentService
- **Controllers**: UserController, MembershipController, ParentLinkController
- **Events**: UserCreated, UserUpdated, StudentCreated, ParentLinked, TeacherAssigned

#### [NEW] `src/modules/organizations/` — Organizations Module
- **Entities**: Organization, OrganizationSettings, Subscription, FeatureFlag, ModuleLicense, WhiteLabelConfig, APIKey
- **Services**: OrganizationService, SubscriptionService, FeatureFlagService
- **Controllers**: OrganizationController, SubscriptionController
- **Events**: OrganizationCreated, SubscriptionChanged, FeatureFlagToggled

#### [NEW] `src/modules/branches/` — Branches Module
- **Entities**: Branch, BranchSettings, Room, Resource, RoomBooking
- **Services**: BranchService, RoomService, ResourceService, RoomBookingService
- **Controllers**: BranchController, RoomController
- **Events**: BranchCreated, BranchDeactivated, RoomBooked

#### [NEW] `src/modules/rbac/` — RBAC/ABAC Module
- **Entities**: Role, Permission, RolePermission, ABACPolicy, CapabilitySet
- **Services**: RBACService, ABACService, PermissionResolver, CapabilityService
- **Seed data**: System roles (Platform Admin, Org Admin, Branch Admin, Teacher, Assistant Teacher, Student, Parent) with default permissions

---

### 4. Academic Modules (MVP)

#### [NEW] `src/modules/lms/` — LMS Module
- **Entities**: Subject, Program, Course, Level, Curriculum, Module, Section, Lesson, Unit, Topic, ContentBlock, ContentType, Homework, HomeworkSubmission, HomeworkGrade, Rubric, Prerequisite, CompletionRecord, CourseTemplate, ReusableBlock, CourseEnrollment
- **Services**: CourseService, ModuleService, LessonService, ContentBlockService, HomeworkService, PrerequisiteService, CompletionService, CourseTemplateService, EnrollmentService
- **Controllers**: CourseController, ModuleController, LessonController, HomeworkController, EnrollmentController
- **Events**: CourseCreated, LessonCompleted, HomeworkAssigned, HomeworkSubmitted, HomeworkGraded, EnrollmentCreated

#### [NEW] `src/modules/attendance/` — Attendance Module
- **Entities**: AttendanceRecord, AttendanceCorrection, AttendanceStatus, AttendanceSummary
- **Services**: AttendanceService, AttendanceReportService, AttendanceAlertService
- **Controllers**: AttendanceController, AttendanceReportController
- **Events**: AttendanceRecorded, AttendanceCorrected

---

### 5. Platform Modules (MVP)

#### [NEW] `src/modules/messaging/` — Messaging Module
- **Entities**: Conversation, Message, MessageDelivery
- **Services**: ConversationService, MessageService, MessageDeliveryService
- **Controllers**: ConversationController, MessageController
- **Gateway**: WebSocket gateway for real-time messaging (Socket.IO)

#### [NEW] `src/modules/notifications/` — Notifications Module
- **Entities**: Notification, NotificationTemplate, NotificationDelivery, NotificationPreference
- **Services**: NotificationService, NotificationDispatcher, NotificationPreference
- **Controllers**: NotificationController, NotificationPreferenceController
- **Jobs**: NotificationDispatch processor

#### [NEW] `src/modules/audit/` — Audit Module
- **Entities**: AuditLog (in `audit` schema)
- **Services**: AuditService, AuditRetentionService
- **Interceptors**: AuditLogging interceptor
- **Controllers**: AuditLogController (read-only)

#### [NEW] `src/modules/storage/` — Storage Module
- **Services**: UploadService, DownloadService, FileScannerService
- **Adapters**: S3Adapter, LocalAdapter (for dev)
- **Controllers**: UploadController, DownloadController

---

### 6. Database Setup

#### [NEW] `src/database/migrations/` — TypeORM Migrations
- Initial migration creating all MVP tables (organizations, branches, users, memberships, roles, permissions, courses, modules, lessons, content_blocks, homework, attendance, messaging, notifications, audit)
- RLS policy setup
- Indexes as specified in SDD §7.4–§7.5

#### [NEW] `src/database/seeds/` — Seed Data
- System roles and permissions
- Default content types
- Sample organization + branch (for development)

---

### 7. Infrastructure

#### [NEW] `infrastructure/docker/docker-compose.yml`
- PostgreSQL 16
- Redis 7
- MinIO (S3-compatible storage)
- OpenSearch 2.x (for future search)
- Application service

#### [NEW] `infrastructure/docker/backend.Dockerfile`

---

### 8. Web Application (`apps/web/`) — MVP Dashboard

#### [NEW] React + Vite + TypeScript scaffold
- Feature-based organization: auth, dashboard, courses, attendance, messaging, settings
- Shared UI components: Button, Input, Modal, Table, Card, Layout
- API service layer using the shared SDK types
- State management with Zustand
- Routing with React Router
- Premium dark/light theme with modern design system

---

## Verification Plan

### Automated Tests
- `pnpm test` — Unit tests for all services (Jest)
- `pnpm test:e2e` — E2E tests for critical API flows (auth, course CRUD, enrollment)
- `pnpm lint` — ESLint across all packages
- `pnpm type-check` — TypeScript strict mode compilation

### Manual Verification
- Docker Compose up → all services healthy
- API health check: `GET /health/ready`
- Auth flow: register → login → refresh → logout
- Course CRUD: create org → create branch → create course → add modules → add lessons
- Attendance: record attendance → view report
- Messaging: send message → receive via WebSocket

---

## Estimated Effort

| Phase | Scope | Files | Estimated Work |
|-------|-------|-------|----------------|
| **Phase 1 (MVP)** | Monorepo + Core + LMS + Attendance + Messaging + Notifications + Web Dashboard | ~200+ files | Large (current plan) |
| Phase 2 (V1) | Gradebook, Groups, Collaboration, Analytics | ~80+ files | Large |
| Phase 3 (V2) | Assessment Engine, Voice, Content Portability | ~100+ files | Large |
| Phase 4 (Enterprise) | Payments, CRM, Finance, Website Builder, Marketplace, Gamification, Automation | ~150+ files | Very Large |

> [!CAUTION]
> Even Phase 1 alone involves ~200+ files across backend and frontend. I recommend we start by building the **backend monorepo scaffold + core modules first**, then the web frontend in a follow-up session. Please confirm your preferred scope.
