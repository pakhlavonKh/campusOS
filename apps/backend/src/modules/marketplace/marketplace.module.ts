import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceListing, MarketplacePurchase, MarketplaceReview } from './entities/marketplace.entity';
import { MarketplaceService } from './services/marketplace.service';
import { MarketplaceController } from './controllers/marketplace.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MarketplaceListing, MarketplacePurchase, MarketplaceReview])],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService, TypeOrmModule],
})
export class MarketplaceModule {}
