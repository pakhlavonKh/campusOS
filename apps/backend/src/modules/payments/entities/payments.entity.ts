import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * PaymentMethod — tokenized payment method details stored securely.
 * SRS §5.16 Payment Gateway Integration.
 */
@Entity('payment_methods')
@Index(['userId', 'isDefault'])
export class PaymentMethod extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  provider!: 'stripe' | 'paypal' | 'custom';

  /** Tokenized reference from gateway provider (e.g., Stripe pm_xxx token) */
  @Column({ name: 'gateway_token', type: 'varchar', length: 255 })
  gatewayToken!: string;

  @Column({ name: 'card_brand', type: 'varchar', length: 30, nullable: true })
  cardBrand!: string | null;

  @Column({ name: 'last_four', type: 'varchar', length: 4, nullable: true })
  lastFour!: string | null;

  @Column({ name: 'expiry_month', type: 'int', nullable: true })
  expiryMonth!: number | null;

  @Column({ name: 'expiry_year', type: 'int', nullable: true })
  expiryYear!: number | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;
}

/**
 * PaymentGatewayConfig — per-tenant payment gateway configuration.
 * SRS §5.16.
 */
@Entity('payment_gateway_configs')
@Index(['organizationId', 'provider'], { unique: true })
export class PaymentGatewayConfig extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  provider!: 'stripe' | 'paypal' | 'custom';

  /** Encrypted API secrets/credentials for the organization */
  @Column({ name: 'api_keys_encrypted', type: 'jsonb' })
  apiKeysEncrypted!: Record<string, any>;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled!: boolean;
}

/**
 * PaymentSchedule — recurring subscription or payment plan scheduling.
 * SRS §5.16.
 */
@Entity('payment_schedules')
@Index(['userId', 'nextBillingDate'])
export class PaymentSchedule extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'billing_interval', type: 'varchar', length: 20, default: 'monthly' })
  billingInterval!: 'weekly' | 'monthly' | 'yearly';

  @Column({ name: 'next_billing_date', type: 'date' })
  nextBillingDate!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId!: string | null;
}
