import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationRule, AutomationExecution, WorkflowTemplate } from './entities/automation.entity';
import { AutomationService } from './services/automation.service';

@Module({
  imports: [TypeOrmModule.forFeature([AutomationRule, AutomationExecution, WorkflowTemplate])],
  providers: [AutomationService],
  exports: [AutomationService, TypeOrmModule],
})
export class AutomationModule {}
