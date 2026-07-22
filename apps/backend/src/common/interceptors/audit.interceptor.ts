import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/services/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Only audit modifying actions
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isMutation) {
      return next.handle();
    }

    // Don't audit login/auth paths to prevent recording raw passwords
    const isAuthPath = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
    if (isAuthPath) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          this.logEvent(request, responseBody, 'SUCCESS');
        },
        error: (err) => {
          this.logEvent(request, { error: err.message }, 'FAILED');
        },
      }),
    );
  }

  private async logEvent(request: any, response: any, status: 'SUCCESS' | 'FAILED') {
    try {
      const user = request.user;
      const organizationId = request.headers['x-tenant-id'] || user?.orgId || '00000000-0000-0000-0000-000000000000';
      const actorId = user?.sub || '00000000-0000-0000-0000-000000000000'; // System or unauthenticated

      let action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' = 'ACCESS';
      if (request.method === 'POST') action = 'CREATE';
      if (['PUT', 'PATCH'].includes(request.method)) action = 'UPDATE';
      if (request.method === 'DELETE') action = 'DELETE';

      // Scrape password/tokens from logged body
      const cleanBody = { ...request.body };
      delete cleanBody.password;
      delete cleanBody.token;
      delete cleanBody.refreshToken;

      await this.auditService.logAction({
        organizationId,
        actorId,
        actorRole: user?.roles?.join(','),
        action,
        resourceType: request.route?.path || request.url,
        resourceId: response?.data?.id || request.params?.id || null,
        newValue: status === 'SUCCESS' ? cleanBody : undefined,
        metadata: {
          status,
          statusCode: request.res?.statusCode,
          error: response?.error || null,
        },
        ipAddress: request.ip || request.headers['x-forwarded-for'],
        userAgent: request.headers['user-agent'],
      });
    } catch (e: any) {
      this.logger.error(`Failed to log audit event: ${e.message}`);
    }
  }
}
