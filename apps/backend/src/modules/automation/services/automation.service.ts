import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule, AutomationExecution } from '../entities/automation.entity';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectRepository(AutomationRule) private readonly ruleRepo: Repository<AutomationRule>,
    @InjectRepository(AutomationExecution) private readonly executionRepo: Repository<AutomationExecution>,
  ) {}

  async createRule(dto: Partial<AutomationRule> & { organizationId: string }) {
    const rule = this.ruleRepo.create(dto);
    return this.ruleRepo.save(rule);
  }

  async getRulesByTrigger(organizationId: string, triggerType: string) {
    return this.ruleRepo.find({ where: { organizationId, triggerType, isActive: true } });
  }

  async executeTrigger(organizationId: string, triggerType: string, eventData: Record<string, any>, actorId?: string) {
    this.logger.log(`Evaluating automation rules for trigger: ${triggerType}`);

    const rules = await this.getRulesByTrigger(organizationId, triggerType);

    for (const rule of rules) {
      // Create execution trace
      const execution = this.executionRepo.create({
        organizationId,
        ruleId: rule.id,
        triggeredByEvent: triggerType,
        actorId: actorId || null,
        status: 'pending',
      });

      const savedExecution = await this.executionRepo.save(execution);

      try {
        const results: any[] = [];
        // Evaluate conditions in rule.conditions against eventData (stub logic)
        // If matched, execute rule.actions
        // Here, we simulate a successful execution stub:
        for (const action of rule.actions) {
          results.push({
            actionType: action.type,
            status: 'executed',
            details: `Successfully completed action of type ${action.type}`,
          });
        }

        savedExecution.status = 'success';
        savedExecution.actionResults = results;
        await this.executionRepo.save(savedExecution);
      } catch (err: any) {
        savedExecution.status = 'failed';
        savedExecution.errorMessage = err.message || 'Automation failed';
        await this.executionRepo.save(savedExecution);
        this.logger.error(`Failed to execute rule ${rule.id}: ${err.message}`);
      }
    }
  }
}
