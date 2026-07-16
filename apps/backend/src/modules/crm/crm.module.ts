import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadSource, Lead, Inquiry, LeadActivity } from './entities/crm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeadSource, Lead, Inquiry, LeadActivity])],
  exports: [TypeOrmModule],
})
export class CrmModule {}
