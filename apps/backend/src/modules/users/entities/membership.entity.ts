import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from './user.entity';

/**
 * Membership Entity — SDD §3.2.2 & SRS §5.30.
 * Links a User to an Organization and optional Branch with specific Role(s).
 * Enables multi-tenancy and context switching.
 */
@Entity('memberships')
export class Membership extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Column({ type: 'text', array: true, default: '{}' })
  roles: string[];

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'suspended' | 'archived';

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;
}
