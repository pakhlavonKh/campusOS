import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationApp, OrganizationIntegration } from '../entities/integration.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(IntegrationApp) private readonly appRepo: Repository<IntegrationApp>,
    @InjectRepository(OrganizationIntegration) private readonly orgAppRepo: Repository<OrganizationIntegration>,
  ) {}

  async getAvailableApps() {
    return this.appRepo.find({ where: { status: 'active' } });
  }

  async getOrganizationIntegrations(organizationId: string) {
    return this.orgAppRepo.find({ where: { organizationId } });
  }

  async configureIntegration(organizationId: string, appId: string, config: any) {
    const app = await this.appRepo.findOne({ where: { id: appId } });
    if (!app) throw new NotFoundException('Integration App not found');

    let orgIntegration = await this.orgAppRepo.findOne({
      where: { organizationId, appId },
    });

    if (orgIntegration) {
      orgIntegration.config = { ...orgIntegration.config, ...config };
    } else {
      orgIntegration = this.orgAppRepo.create({
        organizationId,
        appId,
        config,
      });
    }

    return this.orgAppRepo.save(orgIntegration);
  }
}
