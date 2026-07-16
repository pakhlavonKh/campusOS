import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationTemplate, NotificationRecord } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationTemplate) private readonly templateRepo: Repository<NotificationTemplate>,
    @InjectRepository(NotificationRecord) private readonly recordRepo: Repository<NotificationRecord>,
  ) {}

  // In a real app, this would use nodemailer
  async sendEmail(to: string, subject: string, html: string) {
    this.logger.log(`Mock sending email to ${to}: ${subject}`);
    // mock delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    return true;
  }

  async createInAppNotification(userId: string, subject: string, content: string, organizationId: string) {
    const record = this.recordRepo.create({
      userId,
      organizationId,
      channel: 'in_app',
      subject,
      content,
      status: 'sent',
    });
    return this.recordRepo.save(record);
  }

  // Event Listeners for domain events

  @OnEvent('grade.recorded', { async: true })
  async handleGradeRecorded(payload: any) {
    this.logger.log(`Handling grade.recorded event for student ${payload.data.studentId}`);
    
    await this.createInAppNotification(
      payload.data.studentId,
      'New Grade Posted',
      `A new grade (${payload.data.score}) has been posted for your assignment.`,
      payload.organizationId || null
    );
  }

  @OnEvent('course.published', { async: true })
  async handleCoursePublished(payload: any) {
    this.logger.log(`Handling course.published event for course ${payload.data.courseId}`);
  }
}
