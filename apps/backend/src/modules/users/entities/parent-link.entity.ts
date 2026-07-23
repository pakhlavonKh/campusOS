import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from './user.entity';

/**
 * ParentLink Entity — SDD §3.2.2.
 * Establishes relationships between parent users and student users.
 */
@Entity('parent_links')
export class ParentLink extends BaseEntity {
  @Column({ name: 'parent_id', type: 'uuid' })
  @Index()
  parentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @Column({ name: 'student_id', type: 'uuid' })
  @Index()
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'varchar', length: 50, default: 'parent' })
  relationship: 'father' | 'mother' | 'guardian' | 'parent';

  @Column({ name: 'is_primary_contact', type: 'boolean', default: false })
  isPrimaryContact: boolean;
}
