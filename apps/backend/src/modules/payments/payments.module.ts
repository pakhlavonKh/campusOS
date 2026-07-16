import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod, PaymentGatewayConfig, PaymentSchedule } from './entities/payments.entity';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './controllers/payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, PaymentGatewayConfig, PaymentSchedule])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
