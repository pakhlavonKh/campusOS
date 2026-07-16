import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { MessagingService } from '../services/messaging.service';
import { CurrentUser, TenantId } from '../../../common/decorators/tenant.decorator';

class CreateConversationDto {
  @IsArray()
  @IsString({ each: true })
  participantIds: string[];

  @IsEnum(['direct', 'group'])
  type: 'direct' | 'group';

  @IsString()
  @IsOptional()
  title?: string;
}

@ApiTags('messaging')
@ApiBearerAuth()
@Controller('messaging')
@UseGuards(AuthGuard('jwt'))
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation room' })
  async createConversation(
    @Body() dto: CreateConversationDto,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.messagingService.createConversation({
      ...dto,
      organizationId,
      createdBy: userId,
    });
    return { success: true, data };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all active conversations for the current user' })
  async getConversations(
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.messagingService.getConversations(userId, organizationId);
    return { success: true, data };
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages history for a conversation' })
  async getMessages(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const data = await this.messagingService.getMessages(
      conversationId,
      userId,
      organizationId,
      limit || 50,
      skip || 0,
    );
    return { success: true, data };
  }
}
