import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/** Invoice — payment invoice per student per term. SRS §5.18. */
@Entity('invoices')
@Index(['studentId', 'organizationId'])
@Index(['organizationId', 'status'])
export class Invoice extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'invoice_number', type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @Column({ name: 'term', type: 'varchar', length: 50, nullable: true })
  term: string | null;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'tax', type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

  /** Line items: [{description, quantity, unitPrice, amount}] */
  @Column({ name: 'line_items', type: 'jsonb', default: '[]' })
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string | null;
}

/** Payment — recorded payment against an invoice. SRS §5.18. */
@Entity('payments')
@Index(['invoiceId'])
@Index(['studentId', 'organizationId'])
export class Payment extends BaseEntity {
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'stripe' | 'paypal' | 'manual';

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId: string | null;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}

/** PaymentReminder — scheduled reminder record. SRS §5.18. */
@Entity('payment_reminders')
@Index(['invoiceId'])
export class PaymentReminder extends BaseEntity {
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @Column({ name: 'remind_at', type: 'timestamptz' })
  remindAt: Date;

  @Column({ type: 'varchar', length: 20 })
  channel: 'email' | 'sms' | 'push';

  @Column({ name: 'is_sent', type: 'boolean', default: false })
  isSent: boolean;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;
}

/** CreditNote — refund/credit record. SRS §5.18. */
@Entity('credit_notes')
@Index(['invoiceId'])
@Index(['studentId', 'organizationId'])
export class CreditNote extends BaseEntity {
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'is_applied', type: 'boolean', default: false })
  isApplied: boolean;
}
