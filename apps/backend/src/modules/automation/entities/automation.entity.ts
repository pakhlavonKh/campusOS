import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * AutomationRule — configurable triggers, conditions, and actions.
 * SRS §5.23 Custom Automation Engine.
 */
@Entity('automation_rules')
@Index(['organizationId', 'isActive'])
export class AutomationRule extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /** Event that triggers this rule (e.g., 'course.completed', 'attendance.absent') */
  @Column({ name: 'trigger_type', type: 'varchar', length: 100 })
  triggerType!: string;

  /** JSON-structured conditions (e.g., check student score > 80) */
  @Column({ type: 'jsonb', default: '{}' })
  conditions!: Record<string, any>;

  /** JSON-structured actions (e.g., send email, issue certificate) */
  @Column({ type: 'jsonb', default: '[]' })
  actions!: Array<Record<string, any>>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}

/**
 * AutomationExecution — execution log of rule triggers.
 * SRS §5.23.
 */
@Entity('automation_executions')
@Index(['ruleId', 'status'])
export class AutomationExecution extends BaseEntity {
  @Column({ name: 'rule_id', type: 'uuid' })
  ruleId!: string;

  @Column({ name: 'triggered_by_event', type: 'varchar', length: 100 })
  triggeredByEvent!: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: 'pending' | 'success' | 'failed';

  @Column({ name: 'action_results', type: 'jsonb', default: '[]' })
  actionResults!: Array<Record<string, any>>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;
}

/**
 * WorkflowTemplate — predefined set of automation rules for quick deployment.
 * SRS §5.23.
 */
@Entity('workflow_templates')
@Index(['organizationId'])
export class WorkflowTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Array of predefined rules for the workflow template */
  @Column({ type: 'jsonb', default: '[]' })
  rules!: Array<Record<string, any>>;
}
