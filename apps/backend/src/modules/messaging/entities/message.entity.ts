import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('messages')
@Index(['conversationId'])
@Index(['senderId'])
export class Message extends BaseEntity {
  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;
}
