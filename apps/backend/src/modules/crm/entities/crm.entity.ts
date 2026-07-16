import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/** LeadSource — attribution source. SRS §5.17. */
@Entity('lead_sources')
@Index(['organizationId', 'name'], { unique: true })
export class LeadSource extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 30 })
  type: 'website' | 'referral' | 'social' | 'ad' | 'direct' | 'event' | 'other';

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

/** Lead — prospective student/customer. SRS §5.17. */
@Entity('leads')
@Index(['organizationId', 'status'])
@Index(['email', 'organizationId'])
export class Lead extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId: string | null;

  @Column({ type: 'varchar', length: 30, default: 'new' })
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';

  @Column({ name: 'program_interest', type: 'varchar', length: 255, nullable: true })
  programInterest: string | null;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

/** Inquiry — inbound inquiry with pipeline status. SRS §5.17. */
@Entity('inquiries')
@Index(['organizationId', 'status'])
export class Inquiry extends BaseEntity {
  @Column({ name: 'lead_id', type: 'uuid', nullable: true })
  leadId: string | null;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 30, default: 'open' })
  status: 'open' | 'in_progress' | 'closed';

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string | null;
}

/** LeadActivity — follow-up log entry. SRS §5.17. */
@Entity('lead_activities')
@Index(['leadId'])
export class LeadActivity extends BaseEntity {
  @Column({ name: 'lead_id', type: 'uuid' })
  leadId: string;

  @Column({ name: 'actor_id', type: 'uuid' })
  actorId: string;

  @Column({ type: 'varchar', length: 30 })
  activityType: 'call' | 'email' | 'meeting' | 'note' | 'status_change';

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
