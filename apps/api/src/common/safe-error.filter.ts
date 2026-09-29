import { Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface SafeResponse {
  status(code: number): SafeResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

@Catch()
export class SafeErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const code = status === 503 ? 'TEMPORARILY_UNAVAILABLE'
      : status === 404 ? 'NOT_FOUND'
        : status === 400 ? 'INVALID_INPUT' : 'INTERNAL_ERROR';
    const response = host.switchToHttp().getResponse<SafeResponse>();
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('Vary', 'Cookie');
    response.status(status).json({ error: { code, requestId: randomUUID() } });
  }
}
