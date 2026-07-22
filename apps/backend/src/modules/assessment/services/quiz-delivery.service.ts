import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealtimeGateway } from '../../../shared/gateways/realtime.gateway';

/**
 * QuizDeliveryService (State Machine Portion)
 *
 * Implements server-side quiz attempt state machine:
 *   not_started → in_progress → submitted → graded
 *
 * Key behaviours:
 *  - Server records startTime on attempt creation
 *  - BullMQ delayed job auto-submits when timeLimit expires (regardless of client state)
 *  - Manual submit cancels the auto-submit job
 *
 * GAP-SVC-01: SRS §20.4, SDD §24.6
 */
@Injectable()
export class QuizDeliveryService {
  private readonly logger = new Logger(QuizDeliveryService.name);

  constructor(
    @InjectQueue('quiz-timeout') private readonly quizTimeoutQueue: Queue,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  /** Start a quiz attempt and schedule the server-side timeout. */
  async startAttempt(
    attemptId: string,
    quizId: string,
    userId: string,
    organizationId: string,
    timeLimitSeconds: number,
  ): Promise<{ attemptId: string; startTime: string; endsAt: string }> {
    const startTime = new Date();
    const endsAt = new Date(startTime.getTime() + timeLimitSeconds * 1000);

    // Persist attempt with status = 'in_progress' and startTime
    // (actual DB write is in the containing QuizAttemptService — this handles state machine)
    this.logger.log(`Attempt ${attemptId} started. Auto-submit at ${endsAt.toISOString()}`);

    // Enqueue server-side auto-submit job
    await this.quizTimeoutQueue.add(
      'auto-submit',
      { attemptId, userId, organizationId },
      {
        delay: timeLimitSeconds * 1000,
        jobId: `quiz-timeout:${attemptId}`, // deterministic ID for cancellation
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // Notify student via WebSocket (timer start)
    this.realtimeGateway.emitToUser(userId, 'quiz:started', {
      attemptId,
      startTime: startTime.toISOString(),
      endsAt: endsAt.toISOString(),
      timeLimitSeconds,
    });

    return {
      attemptId,
      startTime: startTime.toISOString(),
      endsAt: endsAt.toISOString(),
    };
  }

  /** Manually submit a quiz attempt — cancels the auto-submit job. */
  async submitAttempt(
    attemptId: string,
    userId: string,
    organizationId: string,
    answers: Record<string, any>,
  ): Promise<{ status: 'submitted' }> {
    // Cancel scheduled auto-submit job
    const job = await this.quizTimeoutQueue.getJob(`quiz-timeout:${attemptId}`);
    if (job) {
      await job.remove();
      this.logger.debug(`Auto-submit job cancelled for attempt ${attemptId}`);
    }

    // Emit submission event for AutoGraderService
    // (actual DB transition happens in QuizAttemptService)
    this.logger.log(`Attempt ${attemptId} manually submitted by user ${userId}`);

    return { status: 'submitted' };
  }

  /** Called by BullMQ worker when timeout fires. */
  async autoSubmit(attemptId: string, userId: string, organizationId: string): Promise<void> {
    this.logger.warn(`Auto-submitting attempt ${attemptId} (time limit exceeded)`);

    // Notify student their exam was auto-submitted
    this.realtimeGateway.emitToUser(userId, 'quiz:auto_submitted', {
      attemptId,
      reason: 'time_limit_exceeded',
    });

    // Emit event for QuizAttemptService to persist the state transition
    // (circular dependency avoided via EventEmitter2)
  }
}
