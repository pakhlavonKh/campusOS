import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * WebhookEndpoint — registered endpoints for outward event streaming.
 * SRS §3.7 Integration Points / Webhooks.
 */
@Entity('webhook_endpoints')
@Index(['organizationId', 'isActive'])
export class WebhookEndpoint extends BaseEntity {
  @Column({ name: 'target_url', type: 'varchar', length: 512 })
  targetUrl!: string;

  /** Array of event tags this webhook subscribes to, e.g., ['student.enrolled', 'grade.recorded'] */
  @Column({ name: 'subscribed_events', type: 'text', array: true })
  subscribedEvents!: string[];

  /** Encrypted secret for validating webhook payloads (HMAC SHA-256 signature header) */
  @Column({ name: 'secret_encrypted', type: 'varchar', length: 255 })
  secretEncrypted!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;
}

/**
 * WebhookDelivery — immutable log of outbound webhook delivery attempts.
 * SRS §3.7.
 */
@Entity('webhook_deliveries')
@Index(['endpointId', 'status'])
export class WebhookDelivery extends BaseEntity {
  @Column({ name: 'endpoint_id', type: 'uuid' })
  endpointId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, any>;

  @Column({ name: 'response_status_code', type: 'int', nullable: true })
  responseStatusCode!: number | null;

  @Column({ name: 'response_body', type: 'text', nullable: true })
  responseBody!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: 'pending' | 'success' | 'failed' | 'retrying';

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount!: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;
}
