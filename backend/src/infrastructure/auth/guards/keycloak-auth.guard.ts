import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class KeycloakAuthGuard extends AuthGuard('keycloak') {
  private readonly logger = new Logger(KeycloakAuthGuard.name);
  
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Log authorization header
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    this.logger.debug(`Authorization header: ${authHeader ? 'présent' : 'absent'}`);
    if (authHeader) {
      this.logger.debug(`Token length: ${authHeader.length}`);
    }

    return super.canActivate(context);
  }
}