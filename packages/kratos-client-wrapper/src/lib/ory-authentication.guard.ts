import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
} from '@nestjs/common';
import { OryFrontendService } from './ory-frontend';
import type { Session } from '@ory/client';

export interface OryAuthenticationGuardOptions {
  cookieResolver: (ctx: ExecutionContext) => string;
  isValidSession: (session: Session) => boolean;
  sessionTokenResolver: (ctx: ExecutionContext) => string;
  postValidationHook?: (
    ctx: ExecutionContext,
    session: Session
  ) => void | Promise<void>;
}

const defaultOptions: OryAuthenticationGuardOptions = {
  isValidSession(): boolean {
    return true;
  },
  sessionTokenResolver: (ctx) =>
    ctx
      .switchToHttp()
      .getRequest()
      ?.headers?.authorization?.replace('Bearer ', ''),
  cookieResolver: (ctx) => ctx.switchToHttp().getRequest()?.headers?.cookie,
};

export const OryAuthenticationGuard = (
  options: Partial<OryAuthenticationGuardOptions> = defaultOptions
) => {
  @Injectable()
  class AuthenticationGuard implements CanActivate {
    constructor(readonly oryService: OryFrontendService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const {
        cookieResolver,
        sessionTokenResolver,
        isValidSession,
        postValidationHook,
      } = {
        ...defaultOptions,
        ...options,
      };

      const cookie = cookieResolver(context);
      const xSessionToken = sessionTokenResolver(context);
      console.warn({
        cookie,
        xSessionToken,
      });
      try {
        const { data: session } = await this.oryService.toSession({
          cookie,
          xSessionToken,
        });
        console.warn('session', session, isValidSession(session));

        if (!isValidSession(session)) {
          return false;
        }
        if (typeof postValidationHook === 'function') {
          await postValidationHook(context, session);
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  }
  return mixin(AuthenticationGuard);
};
