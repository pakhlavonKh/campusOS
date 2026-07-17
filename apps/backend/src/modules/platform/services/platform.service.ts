import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { AuditService } from '../../audit/services/audit.service';

/**
 * PlatformService — handles tenant lifecycle, billing overrides, and impersonation auditing.
 * SDD §3.2.3 and §14.0.
 */
@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    private readonly auditService: AuditService,
  ) {}

  async listOrganizations(): Promise<Organization[]> {
    return this.orgRepo.find({ order: { name: 'ASC' } });
  }

  async updateOrganizationStatus(
    orgId: string,
    status: 'active' | 'suspended' | 'archived',
    actorId: string,
    actorRole: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Organization> {
    const org = await this.orgRepo.findOneBy({ id: orgId });
    if (!org) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }

    const oldValue = { status: org.status };
    org.status = status;
    const updated = await this.orgRepo.save(org);

    // Audit logs for platform actions are retained indefinitely
    await this.auditService.logAction({
      organizationId: orgId,
      actorId,
      actorRole,
      action: 'UPDATE',
      resourceType: 'Organization',
      resourceId: orgId,
      oldValue,
      newValue: { status },
      metadata: { source: 'platform-console', scope: 'tenant-lifecycle' },
      ipAddress,
      userAgent,
    });

    return updated;
  }

  async updateOrganizationQuota(
    orgId: string,
    billingPlan: string,
    settings: Record<string, any>,
    actorId: string,
    actorRole: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Organization> {
    const org = await this.orgRepo.findOneBy({ id: orgId });
    if (!org) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }

    const oldValue = { billingPlan: org.billingPlan, settings: org.settings };
    org.billingPlan = billingPlan;
    org.settings = { ...org.settings, ...settings };
    const updated = await this.orgRepo.save(org);

    await this.auditService.logAction({
      organizationId: orgId,
      actorId,
      actorRole,
      action: 'UPDATE',
      resourceType: 'Organization',
      resourceId: orgId,
      oldValue,
      newValue: { billingPlan, settings: org.settings },
      metadata: { source: 'platform-console', scope: 'quota-update' },
      ipAddress,
      userAgent,
    });

    return updated;
  }

  async logImpersonation(
    orgId: string,
    targetUserId: string,
    reason: string,
    actorId: string,
    actorRole: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.auditService.logAction({
      organizationId: orgId,
      actorId,
      actorRole,
      action: 'ACCESS',
      resourceType: 'UserImpersonation',
      resourceId: targetUserId,
      metadata: { reason, source: 'platform-console', scope: 'support' },
      ipAddress,
      userAgent,
    });
  }
}
