import { Controller, Post, Get, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { PaymentsService } from '../services/payments.service';
import { CurrentUser, TenantId } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RbacGuard } from '../../../common/guards/rbac.guard';

class AddPaymentMethodDto {
  @IsString() provider!: 'stripe' | 'paypal';
  @IsString() gatewayToken!: string;
  @IsString() @IsOptional() cardBrand?: string;
  @IsString() @IsOptional() lastFour?: string;
  @IsNumber() @IsOptional() expiryMonth?: number;
  @IsNumber() @IsOptional() expiryYear?: number;
  @IsBoolean() @IsOptional() isDefault?: boolean;
}

class ConfigureGatewayDto {
  @IsString() provider!: 'stripe' | 'paypal';
  @IsObject() apiKeysEncrypted!: Record<string, any>;
  @IsBoolean() @IsOptional() isEnabled?: boolean;
}

class CreateBillingScheduleDto {
  @IsNumber() amount!: number;
  @IsString() @IsOptional() currency?: string;
  @IsString() billingInterval!: 'weekly' | 'monthly' | 'yearly';
  @IsString() nextBillingDate!: string;
}

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(AuthGuard('jwt'), RbacGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('methods')
  @Permissions('payment:write')
  @ApiOperation({ summary: 'Save tokenized payment method details' })
  async addMethod(
    @Body() dto: AddPaymentMethodDto,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.paymentsService.addPaymentMethod({ ...dto, userId, organizationId });
    return { success: true, data };
  }

  @Get('methods')
  @Permissions('payment:read')
  @ApiOperation({ summary: 'List saved payment methods' })
  async getMethods(@TenantId() organizationId: string, @CurrentUser('sub') userId: string) {
    const data = await this.paymentsService.getPaymentMethods(userId, organizationId);
    return { success: true, data };
  }

  @Post('gateway-configs')
  @Permissions('payment:admin')
  @ApiOperation({ summary: 'Configure payment gateway credentials' })
  async configureGateway(@Body() dto: ConfigureGatewayDto, @TenantId() organizationId: string) {
    const data = await this.paymentsService.configureGateway({ ...dto, organizationId });
    return { success: true, data };
  }

  @Post('schedules')
  @Permissions('payment:write')
  @ApiOperation({ summary: 'Create a recurring billing schedule' })
  async createSchedule(
    @Body() dto: CreateBillingScheduleDto,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.paymentsService.createBillingSchedule({ ...dto, userId, organizationId });
    return { success: true, data };
  }
}
