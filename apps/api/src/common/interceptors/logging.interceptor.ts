import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          this.logRequest(method, url, response.statusCode, startedAt);
        },
        error: (error: { status?: number }) => {
          const status = error.status ?? 500;
          this.logRequest(method, url, status, startedAt);
        },
      }),
    );
  }

  private logRequest(
    method: string,
    path: string,
    statusCode: number,
    startedAt: number,
  ): void {
    const duration = Date.now() - startedAt;
    this.logger.log(`${method} ${path} ${statusCode} ${duration}ms`);
  }
}
