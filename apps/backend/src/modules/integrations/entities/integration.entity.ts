import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * Integration App — Registry of available 3rd party tools (e.g., "Zoom", "Canvas").
 */
@Entity('integration_apps')
export class IntegrationApp {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: 'active' | 'deprecated' | 'beta';

  @Column({ type: 'jsonb', default: {} })
  configSchema: Record<string, any>; // JSON Schema for required config
}

/**
 * Organization Integration — Specific configuration/API keys for a tenant using an app.
 */
@Entity('organization_integrations')
@Index(['organizationId', 'appId'], { unique: true })
export class OrganizationIntegration extends BaseEntity {
  @Column({ name: 'app_id', type: 'uuid' })
  appId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>; // Stores tokens, webhooks, etc. (should be encrypted in a real app)
}
