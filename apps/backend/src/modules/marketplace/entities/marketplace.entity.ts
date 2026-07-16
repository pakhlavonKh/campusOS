import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * MarketplaceListing — published courses or content packages for purchase/licensing.
 * SRS §5.25 Content Marketplace.
 */
@Entity('marketplace_listings')
@Index(['organizationId', 'status'])
@Index(['contentType', 'contentId'])
export class MarketplaceListing extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'content_type', type: 'varchar', length: 50 })
  contentType!: 'course' | 'curriculum' | 'question_bank';

  @Column({ name: 'content_id', type: 'uuid' })
  contentId!: string;

  /** Standard sale price */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  /** License type: single_use, site_license, subscription */
  @Column({ name: 'license_type', type: 'varchar', length: 30, default: 'site_license' })
  licenseType!: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'suspended' | 'archived';

  @Column({ name: 'rating_average', type: 'decimal', precision: 3, scale: 2, nullable: true })
  ratingAverage!: number | null;
}

/**
 * MarketplacePurchase — acquisition records for listing items.
 * SRS §5.25.
 */
@Entity('marketplace_purchases')
@Index(['purchasedByOrgId'])
@Index(['listingId'])
export class MarketplacePurchase extends BaseEntity {
  @Column({ name: 'listing_id', type: 'uuid' })
  listingId!: string;

  /** The organization that purchased this content */
  @Column({ name: 'purchased_by_org_id', type: 'uuid' })
  purchasedByOrgId!: string;

  @Column({ name: 'purchaser_user_id', type: 'uuid' })
  purchaserUserId!: string;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2 })
  amountPaid!: number;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId!: string | null;

  @Column({ name: 'purchased_at', type: 'timestamptz', default: () => 'NOW()' })
  purchasedAt!: Date;

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status!: 'completed' | 'refunded';
}

/**
 * MarketplaceReview — reviews + ratings.
 * SRS §5.25.
 */
@Entity('marketplace_reviews')
@Index(['listingId', 'userId'], { unique: true })
export class MarketplaceReview extends BaseEntity {
  @Column({ name: 'listing_id', type: 'uuid' })
  listingId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  rating!: number; // 1 to 5 stars

  @Column({ type: 'text', nullable: true })
  comment!: string | null;
}
