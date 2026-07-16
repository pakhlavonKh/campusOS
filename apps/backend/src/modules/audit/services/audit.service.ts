import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async logAction(logData: {
    organizationId: string;
    actorId: string;
    actorRole?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'LOGIN' | 'EXPORT';
    resourceType: string;
    resourceId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const log = this.auditRepo.create({
      organizationId: logData.organizationId,
      actorId: logData.actorId,
      actorRole: logData.actorRole || null,
      action: logData.action,
      resourceType: logData.resourceType,
      resourceId: logData.resourceId || null,
      oldValue: logData.oldValue || null,
      newValue: logData.newValue || null,
      metadata: logData.metadata || {},
      ipAddress: logData.ipAddress || null,
      userAgent: logData.userAgent || null,
    });

    const saved = await this.auditRepo.save(log);
    this.logger.log(`Audit Log saved: ${saved.id} - User ${saved.actorId} performed ${saved.action} on ${saved.resourceType}`);
    return saved;
  }
}
