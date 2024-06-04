import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import type { IntrospectedOAuth2Token } from '@ory/client';

import { OryOAuth2Service } from './ory-oauth2';

export interface IOryOAuth2AuthenticationGuard {
  oryService: OryOAuth2Service;
  canActivate(context: ExecutionContext): Promise<boolean>;
}

export interface OryOAuth2AuthenticationGuardOptions {
  scopeResolver: (ctx: ExecutionContext) => string | Promise<string>;
  accessTokenResolver: (ctx: ExecutionContext) => string | Promise<string>;
  isValidToken: (token: IntrospectedOAuth2Token) => boolean;
  postValidationHook?: (
    this: IOryOAuth2AuthenticationGuard,
    ctx: ExecutionContext,
    token: IntrospectedOAuth2Token
  ) => void | Promise<void>;
  unauthorizedFactory: (ctx: ExecutionContext, error: unknown) => Error;
}

const defaultOptions: OryOAuth2AuthenticationGuardOptions = {
  accessTokenResolver: (ctx) =>
    ctx
      .switchToHttp()
      .getRequest()
      ?.headers?.authorization?.replace('Bearer ', ''),
  isValidToken: (token) => token.active,
  scopeResolver: () => '',
  unauthorizedFactory() {
    return new UnauthorizedException();
  },
};

export const OryOAuth2AuthenticationGuard = (
  options: Partial<OryOAuth2AuthenticationGuardOptions> = defaultOptions
): Type<CanActivate> => {
  @Injectable()
  class AuthenticationGuard implements CanActivate {
    constructor(readonly oryService: OryOAuth2Service) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const {
        accessTokenResolver,
        isValidToken,
        postValidationHook,
        scopeResolver,
        unauthorizedFactory,
      } = {
        ...defaultOptions,
        ...options,
      };

      const scope = await scopeResolver(context);
      const token = await accessTokenResolver(context);
      if (!token) {
        throw unauthorizedFactory(context, new Error('No token provided'));
      }

      let decodedToken: IntrospectedOAuth2Token;
      try {
        const { data } = await this.oryService.introspectOAuth2Token({
          token,
          ...(scope && { scope }),
        });
        decodedToken = data;
      } catch (error) {
        throw unauthorizedFactory(context, error);
      }
      if (!isValidToken(decodedToken)) {
        throw unauthorizedFactory(context, new Error('Invalid token'));
      }
      if (typeof postValidationHook === 'function') {
        await postValidationHook.bind(this)(context, decodedToken);
      }
      return true;
    }
  }
  return mixin(AuthenticationGuard);
};
