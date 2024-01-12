import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
} from '@nestjs/common';
import { OryFrontendService } from './ory-frontend';
import type { Session } from '@ory/client';

export const OryAuthenticationGuard = (
  options: {
    cookieResolver: (ctx: ExecutionContext) => string;
    isValidSession: (session: Session) => boolean;
    sessionTokenResolver: (ctx: ExecutionContext) => string;
    postValidationHook?: (
      ctx: ExecutionContext,
      session: Session
    ) => void | Promise<void>;
  } = {
    isValidSession(): boolean {
      return true;
    },
    sessionTokenResolver: (ctx) =>
      ctx.switchToHttp().getRequest().headers.authorization,
    cookieResolver: (ctx) => ctx.switchToHttp().getRequest().headers.cookie,
  }
) => {
  @Injectable()
  class AuthenticationGuard implements CanActivate {
    constructor(readonly oryService: OryFrontendService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const cookie = options.cookieResolver(context);
      const xSessionToken = options.sessionTokenResolver(context);
      const { data: session } = await this.oryService.toSession({
        cookie,
        xSessionToken,
      });
      if (!options.isValidSession(session)) {
        return false;
      }
      if (typeof options.postValidationHook === 'function') {
        await options.postValidationHook(context, session);
      }
      return true;
    }
  }
  return mixin(AuthenticationGuard);
};
