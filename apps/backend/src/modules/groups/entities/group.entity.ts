import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * Cohort — A time-bound grouping of students, often across multiple courses.
 * SDD §3.2.14 Groups & Cohorts Context.
 */
@Entity('cohorts')
export class Cohort extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'archived';
}

/**
 * Group — A smaller subset of students within a course or branch.
 * SDD §3.2.14.
 */
@Entity('groups')
export class Group extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string | null;

  @Column({ name: 'cohort_id', type: 'uuid', nullable: true })
  cohortId: string | null;

  /** Self-referential FK for subgroups (SRS §5.10.1) */
  @Column({ name: 'parent_group_id', type: 'uuid', nullable: true })
  parentGroupId: string | null;

  @Column({ type: 'varchar', length: 30, default: 'standard' })
  type: 'standard' | 'project' | 'cohort_subgroup';

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'max_members', type: 'int', nullable: true })
  maxMembers: number | null;
}

/**
 * Group Member — Junction entity linking users to groups/cohorts.
 */
@Entity('group_members')
@Index(['groupId', 'userId'], { unique: true })
export class GroupMember extends BaseEntity {
  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  role: 'member' | 'leader' | 'moderator';

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'NOW()' })
  joinedAt: Date;
}

/**
 * EnrollmentRule — automatic enrollment rule.
 * SRS §5.10.2 — e.g., "All Level 3 students auto-enroll in Advanced Grammar".
 */
@Entity('enrollment_rules')
@Index(['organizationId'])
export class EnrollmentRule extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string | null;

  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId: string | null;

  @Column({ name: 'cohort_id', type: 'uuid', nullable: true })
  cohortId: string | null;

  @Column({ type: 'varchar', length: 30 })
  triggerType: 'level_assignment' | 'branch_join' | 'program_enrollment' | 'manual';

  /** Conditions evaluated as JSONB: {levelId, branchId, programId, etc.} */
  @Column({ type: 'jsonb', default: '{}' })
  conditions: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'auto_enroll_count', type: 'int', default: 0 })
  autoEnrollCount: number;
}

