import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('conversations')
@Index(['organizationId'])
export class Conversation extends BaseEntity {
  @Column({ type: 'varchar', length: 50, default: 'direct' })
  type: 'direct' | 'group';

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;
}
