import { Entity, Column, Index } from 'typeorm';

/**
 * Audit Log — immutable record of all security-sensitive operations.
 * SDD §5.4 — stored in audit schema with INSERT + SELECT only.
 */
@Entity('audit_logs')
@Index(['organizationId', 'resourceType', 'timestamp'])
@Index(['actorId', 'timestamp'])
export class AuditLog {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'actor_id', type: 'uuid' })
  actorId: string;

  @Column({ name: 'actor_role', type: 'varchar', length: 50, nullable: true })
  actorRole: string | null;

  @Column({ type: 'varchar', length: 50 })
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'LOGIN' | 'EXPORT';

  @Column({ name: 'resource_type', type: 'varchar', length: 100 })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'uuid', nullable: true })
  resourceId: string | null;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: Record<string, any> | null;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: Record<string, any> | null;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  timestamp: Date;
}
