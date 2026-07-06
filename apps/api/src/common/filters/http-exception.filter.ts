import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  code?: string;
  timestamp: string;
  path: string;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as {
          message?: string | string[];
          code?: string;
        };
        message = resp.message ?? exception.message;
      }
    } else if (
      process.env.NODE_ENV !== 'production' &&
      exception instanceof Error
    ) {
      message = exception.message;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (
      exception instanceof HttpException &&
      typeof exception.getResponse() === 'object' &&
      exception.getResponse() !== null
    ) {
      const resp = exception.getResponse() as { code?: string };
      if (resp.code) {
        body.code = resp.code;
      }
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      exception instanceof Error &&
      exception.stack
    ) {
      body.stack = exception.stack;
    }

    response.status(status).json(body);
  }
}
