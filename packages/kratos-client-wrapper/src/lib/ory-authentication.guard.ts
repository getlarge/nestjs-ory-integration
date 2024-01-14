import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  mixin,
  Type,
} from '@nestjs/common';
import type { Session } from '@ory/client';

import { OryFrontendService } from './ory-frontend';

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
): Type<CanActivate> => {
  @Injectable()
  class AuthenticationGuard implements CanActivate {
    readonly logger = new Logger(AuthenticationGuard.name);

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

      try {
        const cookie = cookieResolver(context);
        const xSessionToken = sessionTokenResolver(context);
        const { data: session } = await this.oryService.toSession({
          cookie,
          xSessionToken,
        });
        if (!isValidSession(session)) {
          return false;
        }
        if (typeof postValidationHook === 'function') {
          await postValidationHook(context, session);
        }
        return true;
      } catch (error) {
        this.logger.error(error);
        return false;
      }
    }
  }
  return mixin(AuthenticationGuard);
};
