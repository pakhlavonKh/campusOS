import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('conversation_participants')
@Index(['conversationId'])
@Index(['userId'])
@Index(['conversationId', 'userId'], { unique: true })
export class ConversationParticipant extends BaseEntity {
  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;
}
