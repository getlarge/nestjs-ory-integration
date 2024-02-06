import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  UnauthorizedException,
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
  unauthorizedFactory: (ctx: ExecutionContext, error: unknown) => Error;
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
  unauthorizedFactory(ctx, error) {
    return new UnauthorizedException(error);
  },
};

export const OryAuthenticationGuard = (
  options: Partial<OryAuthenticationGuardOptions> = defaultOptions
): Type<CanActivate> => {
  @Injectable()
  class AuthenticationGuard implements CanActivate {
    constructor(readonly oryService: OryFrontendService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const {
        cookieResolver,
        sessionTokenResolver,
        isValidSession,
        postValidationHook,
        unauthorizedFactory,
      } = {
        ...defaultOptions,
        ...options,
      };

      let session: Session;
      try {
        const cookie = cookieResolver(context);
        const xSessionToken = sessionTokenResolver(context);
        const { data } = await this.oryService.toSession({
          cookie,
          xSessionToken,
        });
        session = data;
      } catch (error) {
        throw unauthorizedFactory(context, error);
      }

      if (!isValidSession(session)) {
        throw unauthorizedFactory(context, new Error('Invalid session'));
      }
      if (typeof postValidationHook === 'function') {
        await postValidationHook(context, session);
      }
      return true;
    }
  }
  return mixin(AuthenticationGuard);
};
