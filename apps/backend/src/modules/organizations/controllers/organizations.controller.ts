import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { OrganizationsService } from '../services/organizations.service';
import { TenantId } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RbacGuard } from '../../../common/guards/rbac.guard';

class CreateOrgDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  billingPlan?: string;
}

class UpdateOrgDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  billingPlan?: string;
}

class ToggleFeatureFlagDto {
  @IsString()
  flagKey: string;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  config?: Record<string, any>;
}

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new organization (Public)' })
  async register(@Body() dto: CreateOrgDto) {
    const org = await this.orgService.create(dto);
    return {
      success: true,
      data: org,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @Get('me')
  @Permissions('organization:read')
  @ApiOperation({ summary: 'Get current organization details' })
  async getMyOrg(@TenantId() tenantId: string) {
    const org = await this.orgService.findOne(tenantId);
    return {
      success: true,
      data: org,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @Put('me')
  @Permissions('organization:update')
  @ApiOperation({ summary: 'Update current organization settings' })
  async updateMyOrg(@TenantId() tenantId: string, @Body() dto: UpdateOrgDto) {
    const org = await this.orgService.update(tenantId, dto);
    return {
      success: true,
      data: org,
    };
  }

  @Get(':slug/white-label/public')
  @ApiOperation({ summary: 'Get white-label styling config by slug (Public for frontend boot)' })
  async getWhiteLabelPublic(@Param('slug') slug: string) {
    const org = await this.orgService.findBySlug(slug);
    const config = await this.orgService.getWhiteLabelConfig(org.id);
    return {
      success: true,
      data: config,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @Get('me/white-label')
  @Permissions('setting:read')
  @ApiOperation({ summary: 'Get white-label styling config' })
  async getWhiteLabel(@TenantId() tenantId: string) {
    const config = await this.orgService.getWhiteLabelConfig(tenantId);
    return {
      success: true,
      data: config,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @Put('me/white-label')
  @Permissions('setting:manage')
  @ApiOperation({ summary: 'Update white-label styling config' })
  async updateWhiteLabel(@TenantId() tenantId: string, @Body() body: Record<string, any>) {
    const org = await this.orgService.updateWhiteLabelConfig(tenantId, body);
    return {
      success: true,
      data: org.whiteLabelConfig,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @Get('me/features')
  @Permissions('setting:read')
  @ApiOperation({ summary: 'Get organization feature flags status' })
  async getFeatures(@TenantId() tenantId: string) {
    const flags = await this.orgService.getFeatureFlags(tenantId);
    return {
      success: true,
      data: flags,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @Post('me/features')
  @Permissions('setting:manage')
  @ApiOperation({ summary: 'Toggle feature flag' })
  async toggleFeature(@TenantId() tenantId: string, @Body() dto: ToggleFeatureFlagDto) {
    const flag = await this.orgService.setFeatureFlag(tenantId, dto.flagKey, dto.enabled, dto.config);
    return {
      success: true,
      data: flag,
    };
  }
}
