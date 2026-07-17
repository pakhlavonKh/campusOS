import { Controller, Get, Patch, Post, Body, Param, UseGuards, Req, Ip, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlatformGuard } from '../../../common/guards/platform.guard';
import { PlatformService } from '../services/platform.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

/**
 * PlatformController — handles requests on the secured /platform/v1 prefix.
 * Only accessible to authenticated users with the 'platform_super_admin' role.
 * SDD §3.2.3.2 and §14.0.
 */
@ApiTags('platform')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PlatformGuard)
@Controller('platform/v1')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @ApiOperation({ summary: 'List all organizations (Tenants)' })
  @Get('organizations')
  async getOrganizations() {
    return this.platformService.listOrganizations();
  }

  @ApiOperation({ summary: 'Update organization status' })
  @Patch('organizations/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'suspended' | 'archived' },
    @Req() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const user = req.user;
    return this.platformService.updateOrganizationStatus(
      id,
      body.status,
      user.sub,
      user.roles.join(','),
      ip,
      userAgent,
    );
  }

  @ApiOperation({ summary: 'Update organization billing plan and quotas' })
  @Patch('organizations/:id/quota')
  async updateQuota(
    @Param('id') id: string,
    @Body() body: { billingPlan: string; settings: Record<string, any> },
    @Req() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const user = req.user;
    return this.platformService.updateOrganizationQuota(
      id,
      body.billingPlan,
      body.settings,
      user.sub,
      user.roles.join(','),
      ip,
      userAgent,
    );
  }

  @ApiOperation({ summary: 'Log a support impersonation session start' })
  @Post('organizations/:id/impersonate')
  async startImpersonation(
    @Param('id') id: string,
    @Body() body: { targetUserId: string; reason: string },
    @Req() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const user = req.user;
    await this.platformService.logImpersonation(
      id,
      body.targetUserId,
      body.reason,
      user.sub,
      user.roles.join(','),
      ip,
      userAgent,
    );
    return { success: true, message: `Impersonation session logged for user ${body.targetUserId}` };
  }
}
