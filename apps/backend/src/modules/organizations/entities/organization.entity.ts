import { Entity, Column, Index } from 'typeorm';
import { PlatformEntity } from '../../../shared/entities/base.entity';

/**
 * Organization — the top-level tenant entity.
 * SDD §3.2.3 and §7.5.
 */
@Entity('organizations')
export class Organization extends PlatformEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'suspended' | 'archived';

  @Column({ name: 'billing_plan', type: 'varchar', length: 50, default: 'free' })
  billingPlan: string;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @Column({ name: 'white_label_config', type: 'jsonb', default: '{}' })
  whiteLabelConfig: Record<string, any>;
}

/**
 * Branch — physical or virtual location under an organization.
 * SDD §3.2.4 and §7.5.
 */
@Entity('branches')
@Index(['organizationId', 'slug'], { unique: true })
export class Branch extends PlatformEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'inactive';

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;
}

/**
 * Feature flag — per-tenant feature/module toggle.
 * SDD §5.3.
 */
@Entity('feature_flags')
@Index(['organizationId', 'flagKey'], { unique: true })
export class FeatureFlag extends PlatformEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'flag_key', type: 'varchar', length: 100 })
  flagKey: string;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, any>;
}

/**
 * Room — classroom or physical resource for scheduling.
 * SDD §3.2.4.
 */
@Entity('rooms')
export class Room extends PlatformEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ name: 'equipment_list', type: 'jsonb', default: '[]' })
  equipmentList: string[];

  @Column({ type: 'varchar', length: 20, default: 'available' })
  status: 'available' | 'unavailable' | 'maintenance';
}
