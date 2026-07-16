import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceListing, MarketplacePurchase, MarketplaceReview } from '../entities/marketplace.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(MarketplaceListing) private readonly listingRepo: Repository<MarketplaceListing>,
    @InjectRepository(MarketplacePurchase) private readonly purchaseRepo: Repository<MarketplacePurchase>,
    @InjectRepository(MarketplaceReview) private readonly reviewRepo: Repository<MarketplaceReview>,
  ) {}

  async createListing(dto: Partial<MarketplaceListing> & { organizationId: string }) {
    const listing = this.listingRepo.create(dto);
    return this.listingRepo.save(listing);
  }

  async getListing(id: string, organizationId: string) {
    const listing = await this.listingRepo.findOne({ where: { id, organizationId } });
    if (!listing) throw new NotFoundException('Marketplace listing not found');
    return listing;
  }

  async purchaseListing(listingId: string, purchaserOrgId: string, purchaserUserId: string, amount: number, transactionId?: string) {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Marketplace listing not found');

    const purchase = this.purchaseRepo.create({
      organizationId: listing.organizationId, // Seller organization
      listingId,
      purchasedByOrgId: purchaserOrgId,
      purchaserUserId,
      amountPaid: amount,
      transactionId: transactionId || null,
      status: 'completed',
    });

    return this.purchaseRepo.save(purchase);
  }

  async submitReview(listingId: string, userId: string, organizationId: string, rating: number, comment?: string) {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const review = this.reviewRepo.create({
      organizationId,
      listingId,
      userId,
      rating,
      comment: comment || null,
    });

    return this.reviewRepo.save(review);
  }
}
