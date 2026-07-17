import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, FeatureFlag } from '../entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(FeatureFlag)
    private readonly flagRepo: Repository<FeatureFlag>,
  ) {}

  /**
   * Create a new organization (tenant)
   */
  async create(data: { name: string; slug: string; billingPlan?: string }): Promise<Organization> {
    const existing = await this.orgRepo.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new ConflictException(`Organization with slug '${data.slug}' already exists.`);
    }

    const organization = this.orgRepo.create({
      name: data.name,
      slug: data.slug,
      billingPlan: data.billingPlan || 'free',
      settings: {},
      whiteLabelConfig: {
        tier: 'token',
        tokens: {
          colorPrimary: '#6366f1',
          colorSecondary: '#4f46e5',
          fontFamily: 'Inter',
          logoUrl: null,
          faviconUrl: null,
          customDomain: null,
        },
        layoutVariant: null,
        customBuildRef: null,
      },
    });

    return this.orgRepo.save(organization);
  }

  /**
   * Find an organization by ID
   */
  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found.`);
    }
    return org;
  }

  /**
   * Find an organization by Slug
   */
  async findBySlug(slug: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { slug } });
    if (!org) {
      throw new NotFoundException(`Organization with slug '${slug}' not found.`);
    }
    return org;
  }

  /**
   * Update organization settings/fields
   */
  async update(id: string, updateData: Partial<Organization>): Promise<Organization> {
    const org = await this.findOne(id);
    Object.assign(org, updateData);
    return this.orgRepo.save(org);
  }

  /**
   * Get white-label styling config for frontend injection
   */
  async getWhiteLabelConfig(id: string): Promise<Record<string, any>> {
    const org = await this.findOne(id);
    return org.whiteLabelConfig || {};
  }

  /**
   * Update white-label styling config
   */
  async updateWhiteLabelConfig(id: string, config: Record<string, any>): Promise<Organization> {
    const org = await this.findOne(id);
    org.whiteLabelConfig = {
      ...(org.whiteLabelConfig || {}),
      ...config,
    };
    return this.orgRepo.save(org);
  }

  /**
   * Check if a feature flag is enabled for an organization
   */
  async isFeatureEnabled(organizationId: string, flagKey: string): Promise<boolean> {
    const flag = await this.flagRepo.findOne({
      where: { organizationId, flagKey },
    });
    return flag ? flag.enabled : false;
  }

  /**
   * Enable/disable or set config of a feature flag
   */
  async setFeatureFlag(
    organizationId: string,
    flagKey: string,
    enabled: boolean,
    config: Record<string, any> = {},
  ): Promise<FeatureFlag> {
    let flag = await this.flagRepo.findOne({
      where: { organizationId, flagKey },
    });

    if (flag) {
      flag.enabled = enabled;
      flag.config = config;
    } else {
      flag = this.flagRepo.create({
        organizationId,
        flagKey,
        enabled,
        config,
      });
    }

    return this.flagRepo.save(flag);
  }

  /**
   * Get all active feature flags for an organization
   */
  async getFeatureFlags(organizationId: string): Promise<FeatureFlag[]> {
    return this.flagRepo.find({ where: { organizationId } });
  }
}
