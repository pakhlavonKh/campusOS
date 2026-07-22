import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

/**
 * RealtimeGateway
 *
 * Single WebSocket gateway handling:
 *  - Real-time messaging (SRS §5.14)
 *  - Live discussion thread updates (SRS §5.11)
 *  - Live quiz anti-cheat monitoring (SRS §5.8.5)
 *  - In-app notification delivery (SRS §5.15)
 *  - Org-wide maintenance banners (SRS §5.28)
 *
 * Room naming convention (from SDD §24.4):
 *  - org:{organizationId}    — org-wide events
 *  - branch:{branchId}       — branch-scoped events
 *  - user:{userId}           — personal notifications / messages
 *  - quiz:{attemptId}        — live anti-cheat monitoring
 *  - thread:{threadId}       — real-time discussion
 *
 * GAP-SVC-07: SRS §20.4, SDD §24.4
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/realtime',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('RealtimeGateway initialized');
  }

  async handleConnection(socket: Socket) {
    try {
      const token =
        (socket.handshake.auth?.token as string) ||
        (socket.handshake.headers?.authorization as string)?.replace('Bearer ', '');

      if (!token) throw new UnauthorizedException('No token provided');

      const payload = this.jwtService.verify(token) as {
        sub: string;
        organizationId: string;
        branchId?: string;
        roles: string[];
      };

      // Store decoded payload on socket for later use
      (socket as any).user = payload;

      // Join scoped rooms
      socket.join(`org:${payload.organizationId}`);
      if (payload.branchId) socket.join(`branch:${payload.branchId}`);
      socket.join(`user:${payload.sub}`);

      this.logger.debug(
        `Client connected: ${socket.id} → user:${payload.sub} org:${payload.organizationId}`,
      );
    } catch (err: any) {
      const message = err?.message || String(err);
      this.logger.warn(`Unauthorized socket connection: ${message}`);
      socket.emit('error', { code: 'UNAUTHORIZED', message });
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.debug(`Client disconnected: ${socket.id}`);
  }

  // ── Room join helpers (called by students/proctors) ────────────────────────

  @SubscribeMessage('join:quiz')
  handleJoinQuiz(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { attemptId: string },
  ) {
    socket.join(`quiz:${data.attemptId}`);
    this.logger.debug(`${socket.id} joined quiz room: ${data.attemptId}`);
    return { joined: `quiz:${data.attemptId}` };
  }

  @SubscribeMessage('join:thread')
  handleJoinThread(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    socket.join(`thread:${data.threadId}`);
    return { joined: `thread:${data.threadId}` };
  }

  // ── Emit helpers (called by services) ─────────────────────────────────────

  /** Broadcast to all sockets in an organization. */
  emitToOrg(organizationId: string, event: string, data: unknown) {
    this.server.to(`org:${organizationId}`).emit(event, data);
  }

  /** Send to a specific branch. */
  emitToBranch(branchId: string, event: string, data: unknown) {
    this.server.to(`branch:${branchId}`).emit(event, data);
  }

  /** Send to a specific user (all their connected sockets). */
  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /** Send to quiz attempt room (student + assigned proctors). */
  emitToQuizAttempt(attemptId: string, event: string, data: unknown) {
    this.server.to(`quiz:${attemptId}`).emit(event, data);
  }

  /** Send to a discussion thread room. */
  emitToThread(threadId: string, event: string, data: unknown) {
    this.server.to(`thread:${threadId}`).emit(event, data);
  }

  /** Maintenance banner — broadcast to ALL connected sockets platform-wide. */
  broadcastMaintenance(message: string, scheduledAt?: Date) {
    this.server.emit('maintenance:banner', { message, scheduledAt });
  }
}
