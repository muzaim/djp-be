import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../modules/audit-logs/audit-logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const { method, url, body, ip, headers, user } = req;

    // Only log write/mutation requests or login/auth routes
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isListEndpoint = url.endsWith('/list');

    if (!isMutation || isListEndpoint) {
      return next.handle();
    }

    const action = this.deriveAction(method, url);
    const sanitizedPayload = this.sanitizePayload(body);

    return next.handle().pipe(
      tap({
        next: () => {
          this.auditLogsService
            .log({
              userId: user?.id,
              userEmail: user?.email,
              action,
              method,
              path: url,
              ipAddress:
                ip || headers['x-forwarded-for'] || req.connection?.remoteAddress,
              userAgent: headers['user-agent'],
              payload: sanitizedPayload,
              statusCode: res.statusCode,
            })
            .catch((err) =>
              console.error('Failed to save audit log:', err.message),
            );
        },
        error: (err) => {
          this.auditLogsService
            .log({
              userId: user?.id,
              userEmail: user?.email,
              action,
              method,
              path: url,
              ipAddress:
                ip || headers['x-forwarded-for'] || req.connection?.remoteAddress,
              userAgent: headers['user-agent'],
              payload: sanitizedPayload,
              statusCode: err.status || 500,
            })
            .catch((e) =>
              console.error('Failed to save error audit log:', e.message),
            );
        },
      }),
    );
  }

  private deriveAction(method: string, path: string): string {
    const cleanPath = path.split('?')[0];
    if (cleanPath.includes('/auth/login')) return 'USER_LOGIN';
    if (cleanPath.includes('/auth/change-password')) return 'USER_CHANGE_PASSWORD';
    if (cleanPath.includes('/reset-password')) return 'ADMIN_RESET_PASSWORD';

    const segments = cleanPath.split('/').filter((s) => s && s !== 'api' && s !== 'v1');
    const targetName = (segments[0] || 'RESOURCE').toUpperCase();

    switch (method) {
      case 'POST':
        return `CREATE_${targetName}`;
      case 'PATCH':
      case 'PUT':
        return `UPDATE_${targetName}`;
      case 'DELETE':
        return `DELETE_${targetName}`;
      default:
        return `${method}_${targetName}`;
    }
  }

  private sanitizePayload(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };
    const sensitiveKeys = [
      'password',
      'confirmPassword',
      'newPassword',
      'retypePassword',
      'retypeNewPassword',
      'confirmNewPassword',
    ];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.includes(key)) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}
