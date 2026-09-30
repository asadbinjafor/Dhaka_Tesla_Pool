import { Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { BusinessError } from './business-error.js';

interface SafeResponse {
  status(code: number): SafeResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

@Catch()
export class SafeErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const databaseCode = (exception as {code?: string} | null)?.code;
    const transient = databaseCode && /^(08|57|55P03|ECONN|ETIMEDOUT)/.test(databaseCode);
    const status = exception instanceof HttpException ? exception.getStatus() : transient ? 503 : 500;
    const code = exception instanceof BusinessError ? exception.code : status === 503 ? 'TEMPORARILY_UNAVAILABLE'
      : status === 404 ? 'NOT_FOUND'
        : status === 400 ? 'INVALID_INPUT' : status === 401 ? 'AUTH_REQUIRED' : status === 403 ? 'FORBIDDEN_ROLE' : status === 429 ? 'RATE_LIMITED' : 'INTERNAL_ERROR';
    const response = host.switchToHttp().getResponse<SafeResponse>();
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('Vary', 'Cookie');
    const requestId = randomUUID();
    if (status >= 500) console.error(JSON.stringify({event:'request_failed',requestId,code}));
    response.status(status).json({ error: { code, requestId, ...(exception instanceof BusinessError && exception.details ? {details:exception.details} : {}) } });
  }
}
