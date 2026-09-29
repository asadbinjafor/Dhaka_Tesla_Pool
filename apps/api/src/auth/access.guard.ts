import { Inject, Injectable, SetMetadata } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth.service.js';
import { fail } from '../common/business-error.js';

export const Public = () => SetMetadata('public',true);
export const Roles = (...roles:string[]) => SetMetadata('roles',roles);
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth:AuthService,@Inject(Reflector) private readonly reflector:Reflector) {}
  async canActivate(context:ExecutionContext) {
    const request=context.switchToHttp().getRequest<AuthRequest>();
    if(request.path.startsWith('/api/v1/health/')) return true;
    request.authSession=await this.auth.load(request);
    const publicRoute=this.reflector.getAllAndOverride<boolean>('public',[context.getHandler(),context.getClass()]);
    if(!publicRoute && !request.authSession?.user) fail('AUTH_REQUIRED',401);
    if(!['GET','HEAD','OPTIONS'].includes(request.method)) this.auth.checkCsrf(request);
    const roles=this.reflector.getAllAndOverride<string[]>('roles',[context.getHandler(),context.getClass()]);
    if(roles && (!request.authSession?.user || !roles.includes(request.authSession.user.role))) fail('FORBIDDEN_ROLE',403);
    return true;
  }
}
