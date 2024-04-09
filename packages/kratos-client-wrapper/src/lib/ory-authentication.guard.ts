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

export interface IOryAuthenticationGuard {
  canActivate(context: ExecutionContext): Promise<boolean>;
  oryService: OryFrontendService;
}

export interface OryAuthenticationGuardOptions {
  cookieResolver: (ctx: ExecutionContext) => string;
  isValidSession: (session: Session) => boolean;
  sessionTokenResolver: (ctx: ExecutionContext) => string;
  postValidationHook?: (
    this: IOryAuthenticationGuard,
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
  unauthorizedFactory() {
    return new UnauthorizedException();
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

      const cookie = cookieResolver(context);
      const xSessionToken = sessionTokenResolver(context);
      if (!cookie && !xSessionToken) {
        throw unauthorizedFactory(context, new Error('No session token'));
      }
      let session: Session;
      try {
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
        await postValidationHook.bind(this)(context, session);
      }
      return true;
    }
  }
  return mixin(AuthenticationGuard);
};
