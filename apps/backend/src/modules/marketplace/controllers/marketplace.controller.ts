import { Controller, Post, Get, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { MarketplaceService } from '../services/marketplace.service';
import { CurrentUser, TenantId } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RbacGuard } from '../../../common/guards/rbac.guard';

class CreateListingDto {
  @IsString() title!: string;
  @IsString() @IsOptional() description?: string;
  @IsString() contentType!: 'course' | 'curriculum' | 'question_bank';
  @IsUUID() contentId!: string;
  @IsNumber() price!: number;
  @IsString() @IsOptional() currency?: string;
}

class PurchaseListingDto {
  @IsNumber() amountPaid!: number;
  @IsString() @IsOptional() transactionId?: string;
}

class ReviewListingDto {
  @IsNumber() rating!: number;
  @IsString() @IsOptional() comment?: string;
}

@ApiTags('marketplace')
@ApiBearerAuth()
@Controller('marketplace')
@UseGuards(AuthGuard('jwt'), RbacGuard)
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('listings')
  @Permissions('marketplace:write')
  @ApiOperation({ summary: 'Create a marketplace listing for content' })
  async create(@Body() dto: CreateListingDto, @TenantId() organizationId: string) {
    const data = await this.marketplaceService.createListing({ ...dto, organizationId });
    return { success: true, data };
  }

  @Get('listings/:id')
  @Permissions('marketplace:read')
  @ApiOperation({ summary: 'Get details of a listing' })
  async get(@Param('id', ParseUUIDPipe) id: string, @TenantId() organizationId: string) {
    const data = await this.marketplaceService.getListing(id, organizationId);
    return { success: true, data };
  }

  @Post('listings/:id/purchase')
  @Permissions('marketplace:write')
  @ApiOperation({ summary: 'Purchase a marketplace listing' })
  async purchase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PurchaseListingDto,
    @TenantId() purchaserOrgId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.marketplaceService.purchaseListing(
      id,
      purchaserOrgId,
      userId,
      dto.amountPaid,
      dto.transactionId,
    );
    return { success: true, data };
  }

  @Post('listings/:id/reviews')
  @Permissions('marketplace:write')
  @ApiOperation({ summary: 'Submit a review for listed content' })
  async review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewListingDto,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.marketplaceService.submitReview(
      id,
      userId,
      organizationId,
      dto.rating,
      dto.comment,
    );
    return { success: true, data };
  }
}
