import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, Payment, PaymentReminder, CreditNote } from './entities/finance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Payment, PaymentReminder, CreditNote])],
  exports: [TypeOrmModule],
})
export class FinanceModule {}
