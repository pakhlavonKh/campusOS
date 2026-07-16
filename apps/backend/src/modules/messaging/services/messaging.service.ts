import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/participant.entity';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation) private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private readonly participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
  ) {}

  async createConversation(dto: {
    organizationId: string;
    branchId?: string;
    participantIds: string[];
    type: 'direct' | 'group';
    title?: string;
    createdBy: string;
  }) {
    // Save Conversation
    const conversation = this.conversationRepo.create({
      organizationId: dto.organizationId,
      branchId: dto.branchId || null,
      type: dto.type,
      title: dto.title || null,
      createdBy: dto.createdBy,
    });
    const saved = await this.conversationRepo.save(conversation);

    // Add all participants (including the creator)
    const participants = Array.from(new Set([...dto.participantIds, dto.createdBy]));
    const participantEntities = participants.map((userId) =>
      this.participantRepo.create({
        organizationId: dto.organizationId,
        branchId: dto.branchId || null,
        conversationId: saved.id,
        userId,
        createdBy: dto.createdBy,
      }),
    );
    await this.participantRepo.save(participantEntities);

    return saved;
  }

  async getConversations(userId: string, organizationId: string) {
    const participants = await this.participantRepo.find({
      where: { userId, organizationId },
    });

    if (participants.length === 0) return [];

    const conversationIds = participants.map((p) => p.conversationId);

    return this.conversationRepo.createQueryBuilder('c')
      .where('c.id IN (:...conversationIds)', { conversationIds })
      .andWhere('c.organizationId = :organizationId', { organizationId })
      .orderBy('c.createdAt', 'DESC')
      .getMany();
  }

  async verifyParticipant(userId: string, conversationId: string, organizationId: string) {
    const participant = await this.participantRepo.findOne({
      where: { userId, conversationId, organizationId },
    });
    if (!participant) {
      throw new ForbiddenException('User is not a participant in this conversation');
    }
  }

  async getMessages(conversationId: string, userId: string, organizationId: string, limit = 50, skip = 0) {
    await this.verifyParticipant(userId, conversationId, organizationId);

    return this.messageRepo.find({
      where: { conversationId, organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });
  }

  async saveMessage(dto: {
    organizationId: string;
    branchId?: string;
    conversationId: string;
    senderId: string;
    content: string;
  }) {
    await this.verifyParticipant(dto.senderId, dto.conversationId, dto.organizationId);

    const message = this.messageRepo.create({
      organizationId: dto.organizationId,
      branchId: dto.branchId || null,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      content: dto.content,
      createdBy: dto.senderId,
    });

    return this.messageRepo.save(message);
  }
}
