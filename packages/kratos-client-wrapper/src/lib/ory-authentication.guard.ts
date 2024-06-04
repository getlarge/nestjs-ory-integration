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
  cookieResolver: (
    this: IOryAuthenticationGuard,
    ctx: ExecutionContext
  ) => string | Promise<string>;
  isValidSession: (this: IOryAuthenticationGuard, session: Session) => boolean;
  sessionTokenResolver: (
    this: IOryAuthenticationGuard,
    ctx: ExecutionContext
  ) => string | Promise<string>;
  postValidationHook?: (
    this: IOryAuthenticationGuard,
    ctx: ExecutionContext,
    session: Session
  ) => void | Promise<void>;
  unauthorizedFactory: (
    this: IOryAuthenticationGuard,
    ctx: ExecutionContext,
    error: unknown
  ) => Error;
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

      const cookie = await cookieResolver.bind(this)(context);
      const xSessionToken = await sessionTokenResolver.bind(this)(context);
      if (!cookie && !xSessionToken) {
        throw unauthorizedFactory.bind(this)(
          context,
          new Error('No session token')
        );
      }
      let session: Session;
      try {
        const { data } = await this.oryService.toSession({
          cookie,
          xSessionToken,
        });
        session = data;
      } catch (error) {
        throw unauthorizedFactory.bind(this)(context, error);
      }

      if (!isValidSession.bind(this)(session)) {
        throw unauthorizedFactory.bind(this)(
          context,
          new Error('Invalid session')
        );
      }
      if (typeof postValidationHook === 'function') {
        await postValidationHook.bind(this)(context, session);
      }
      return true;
    }
  }
  return mixin(AuthenticationGuard);
};
