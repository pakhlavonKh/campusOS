import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * Notification Template — HTML templates for different notification types.
 * SDD §5.3 Platform Modules.
 */
@Entity('notification_templates')
export class NotificationTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  htmlBody: string;

  @Column({ type: 'text', nullable: true })
  textBody: string | null;

  @Column({ type: 'jsonb', default: [] })
  variables: string[];
}

/**
 * Notification Record — Tracks sent notifications.
 */
@Entity('notification_records')
@Index(['userId', 'isRead'])
export class NotificationRecord extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  channel: 'email' | 'in_app' | 'sms';

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status: 'pending' | 'sent' | 'failed';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;
}

/**
 * NotificationPreference — per-user opt-in/out per channel and category.
 * SRS §5.15 — "Notification preferences per user (opt-in/opt-out per channel and category)."
 */
@Entity('notification_preferences')
@Index(['userId', 'organizationId'])
export class NotificationPreference extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** The notification category (e.g., homework_due, attendance_absent, grade_published) */
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ name: 'email_enabled', type: 'boolean', default: true })
  emailEnabled: boolean;

  @Column({ name: 'push_enabled', type: 'boolean', default: true })
  pushEnabled: boolean;

  @Column({ name: 'sms_enabled', type: 'boolean', default: false })
  smsEnabled: boolean;

  @Column({ name: 'in_app_enabled', type: 'boolean', default: true })
  inAppEnabled: boolean;
}

