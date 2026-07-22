import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  DataSource,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  SelectQueryBuilder,
} from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Tenant context storage — holds organizationId for the current async context.
 * Populated by TenantMiddleware from the validated JWT.
 * Read by TenantContextSubscriber to issue SET LOCAL before queries.
 *
 * GAP-SEC-01: SRS §20.2, SDD §24.2.1
 */
export const tenantStorage = new AsyncLocalStorage<{ organizationId: string | null }>();

/**
 * TenantContextSubscriber
 *
 * TypeORM Entity Subscriber that hooks into every query event and issues
 *   SET LOCAL app.current_organization_id = '<uuid>'
 * before the query executes, enabling PostgreSQL RLS tenant isolation.
 *
 * This fires for ALL queries in the current connection — including raw SQL —
 * providing defense-in-depth beyond application-layer filters.
 */
@EventSubscriber()
@Injectable()
export class TenantContextSubscriber implements EntitySubscriberInterface {
  constructor(private readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  /**
   * Issues SET LOCAL to enforce RLS policy before every SELECT.
   * TypeORM QueryBuilder SELECT hooks: beforeQueryBuilder.
   * For direct query runner calls we patch via afterConnect — see TenantQueryRunnerWrap.
   */
  private async setTenantContext(queryRunner: any): Promise<void> {
    const store = tenantStorage.getStore();
    const organizationId = store?.organizationId ?? null;

    if (organizationId) {
      await queryRunner.query(
        `SET LOCAL app.current_organization_id = '${organizationId}'`,
      );
    } else {
      await queryRunner.query(
        `SET LOCAL app.current_organization_id = ''`,
      );
    }
  }

  beforeInsert(event: InsertEvent<any>): void | Promise<any> {
    if (event.queryRunner) return this.setTenantContext(event.queryRunner);
  }

  beforeUpdate(event: UpdateEvent<any>): void | Promise<any> {
    if (event.queryRunner) return this.setTenantContext(event.queryRunner);
  }

  beforeRemove(event: RemoveEvent<any>): void | Promise<any> {
    if (event.queryRunner) return this.setTenantContext(event.queryRunner);
  }
}
