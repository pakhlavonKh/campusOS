import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * ScheduleEntry — a single time-blocked event (class session, exam, event).
 * SRS §5.13 — supports class timetables, exam calendars, and room booking.
 */
@Entity('schedule_entries')
@Index(['organizationId', 'branchId', 'startTime'])
@Index(['teacherId', 'startTime'])
export class ScheduleEntry extends BaseEntity {
  @Column({ name: 'teacher_id', type: 'uuid', nullable: true })
  teacherId: string | null;

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string | null;

  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId: string | null;

  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 30, default: 'class' })
  entryType: 'class' | 'exam' | 'event' | 'office_hours' | 'break';

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_rule_id', type: 'uuid', nullable: true })
  recurrenceRuleId: string | null;

  @Column({ name: 'color', type: 'varchar', length: 20, nullable: true })
  color: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;
}

/**
 * RecurringRule — RRULE-based recurrence configuration.
 * SRS §5.13 — "Support recurring class schedules, office hours, and events."
 */
@Entity('recurring_rules')
export class RecurringRule extends BaseEntity {
  /** RFC 5545 RRULE string, e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR" */
  @Column({ name: 'rrule', type: 'text' })
  rrule: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'max_occurrences', type: 'int', nullable: true })
  maxOccurrences: number | null;
}

/**
 * CalendarSync — Google/Outlook sync configuration per user/branch.
 * SRS §5.13 — "Sync schedules with Google Calendar and Microsoft Outlook."
 */
@Entity('calendar_syncs')
@Index(['userId'])
@Index(['branchId'])
export class CalendarSync extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'provider', type: 'varchar', length: 30 })
  provider: 'google' | 'microsoft';

  @Column({ name: 'access_token_encrypted', type: 'text' })
  accessTokenEncrypted: string;

  @Column({ name: 'refresh_token_encrypted', type: 'text', nullable: true })
  refreshTokenEncrypted: string | null;

  @Column({ name: 'token_expires_at', type: 'timestamptz', nullable: true })
  tokenExpiresAt: Date | null;

  @Column({ name: 'external_calendar_id', type: 'varchar', length: 255, nullable: true })
  externalCalendarId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true })
  lastSyncedAt: Date | null;
}

/**
 * Booking — room or resource booking for a schedule entry.
 * SRS §5.13 — "Resource and classroom management."
 */
@Entity('bookings')
@Index(['roomId', 'startTime'])
export class Booking extends BaseEntity {
  @Column({ name: 'room_id', type: 'uuid' })
  roomId: string;

  @Column({ name: 'schedule_entry_id', type: 'uuid', nullable: true })
  scheduleEntryId: string | null;

  @Column({ name: 'booked_by', type: 'uuid' })
  bookedBy: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'text', nullable: true })
  purpose: string | null;

  @Column({ type: 'varchar', length: 20, default: 'confirmed' })
  status: 'pending' | 'confirmed' | 'cancelled';
}
