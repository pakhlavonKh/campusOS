import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { MessagingService } from '../services/messaging.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MessagingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagingService: MessagingService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const authHeader = socket.handshake.headers.authorization || socket.handshake.auth.token;
      if (!authHeader) {
        socket.disconnect();
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      socket.data.user = payload;
      
      this.logger.log(`Client connected: ${socket.id} (User: ${payload.sub})`);
    } catch (e) {
      this.logger.warn(`Connection rejected: invalid token`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('conversationId') conversationId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const organizationId = user.orgId;

    try {
      await this.messagingService.verifyParticipant(user.sub, conversationId, organizationId);
      socket.join(conversationId);
      this.logger.log(`User ${user.sub} joined room ${conversationId}`);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() dto: { conversationId: string; content: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const organizationId = user.orgId;
    const branchId = user.branchId;

    try {
      const message = await this.messagingService.saveMessage({
        organizationId,
        branchId: branchId || undefined,
        conversationId: dto.conversationId,
        senderId: user.sub,
        content: dto.content,
      });

      // Broadcast message to all sockets in the conversation room
      this.server.to(dto.conversationId).emit('newMessage', message);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
