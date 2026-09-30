import { HttpException } from '@nestjs/common';

export class BusinessError extends HttpException {
  constructor(public readonly code: string, status: number, public readonly details?: Record<string, number>) {
    super({ code }, status);
  }
}
export function fail(code: string, status = 409): never { throw new BusinessError(code, status); }
