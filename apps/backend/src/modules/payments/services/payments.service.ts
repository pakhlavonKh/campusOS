import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod, PaymentGatewayConfig, PaymentSchedule } from '../entities/payments.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentMethod) private readonly methodRepo: Repository<PaymentMethod>,
    @InjectRepository(PaymentGatewayConfig) private readonly configRepo: Repository<PaymentGatewayConfig>,
    @InjectRepository(PaymentSchedule) private readonly scheduleRepo: Repository<PaymentSchedule>,
  ) {}

  async addPaymentMethod(dto: Partial<PaymentMethod> & { userId: string; organizationId: string }) {
    if (dto.isDefault) {
      // Clear previous default methods
      await this.methodRepo.update({ userId: dto.userId, isDefault: true }, { isDefault: false });
    }
    const method = this.methodRepo.create(dto);
    return this.methodRepo.save(method);
  }

  async getPaymentMethods(userId: string, organizationId: string) {
    return this.methodRepo.find({ where: { userId, organizationId } });
  }

  async configureGateway(dto: Partial<PaymentGatewayConfig> & { organizationId: string }) {
    let config = await this.configRepo.findOne({ where: { organizationId: dto.organizationId, provider: dto.provider } });

    if (!config) {
      config = this.configRepo.create(dto);
    } else {
      Object.assign(config, dto);
    }

    return this.configRepo.save(config);
  }

  async createBillingSchedule(dto: Partial<PaymentSchedule> & { userId: string; organizationId: string }) {
    const schedule = this.scheduleRepo.create(dto);
    return this.scheduleRepo.save(schedule);
  }
}
