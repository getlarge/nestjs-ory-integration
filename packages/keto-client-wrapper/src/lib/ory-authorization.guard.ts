import {
  createPermissionCheckQuery,
  parseRelationTuple,
} from '@getlarge/keto-relations-parser';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';

import {
  EnhancedRelationTupleFactory,
  getOryPermissionChecks,
} from './ory-permission-checks.decorator';
import { OryPermissionsService } from './ory-permissions';

export interface OryAuthorizationGuardOptions {
  postCheck?: (
    this: IAuthorizationGuard,
    relationTuple: string | string[],
    isPermitted: boolean
  ) => void;
  unauthorizedFactory: (
    this: IAuthorizationGuard,
    ctx: ExecutionContext,
    error: unknown
  ) => Error;
}

export abstract class IAuthorizationGuard implements CanActivate {
  abstract options: OryAuthorizationGuardOptions;
  abstract canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean>;

  abstract evaluateConditions(
    factory: EnhancedRelationTupleFactory,
    context: ExecutionContext
  ): Promise<{
    allowed: boolean;
    relationTuple: string | string[];
  }>;
}

const defaultOptions: OryAuthorizationGuardOptions = {
  unauthorizedFactory: () => {
    return new ForbiddenException();
  },
};

export const OryAuthorizationGuard = (
  options: Partial<OryAuthorizationGuardOptions> = {}
): Type<IAuthorizationGuard> => {
  @Injectable()
  class AuthorizationGuard implements CanActivate {
    constructor(
      readonly reflector: Reflector,
      readonly oryService: OryPermissionsService
    ) {}

    get options(): OryAuthorizationGuardOptions {
      return {
        ...defaultOptions,
        ...options,
      };
    }

    async evaluateConditions(
      factory: EnhancedRelationTupleFactory,
      context: ExecutionContext
    ): Promise<{
      allowed: boolean;
      relationTuple: string | string[];
    }> {
      if (typeof factory === 'string' || typeof factory === 'function') {
        const { unauthorizedFactory } = this.options;

        const relationTuple =
          typeof factory === 'string' ? factory : factory(context);
        const result = createPermissionCheckQuery(
          parseRelationTuple(relationTuple).unwrapOrThrow()
        );

        if (result.hasError()) {
          throw unauthorizedFactory.bind(this)(context, result.error);
        }

        try {
          const { data } = await this.oryService.checkPermission(result.value);
          return { allowed: data.allowed, relationTuple };
        } catch (error) {
          throw unauthorizedFactory.bind(this)(context, error);
        }
      }
      const evaluatedConditions = await Promise.all(
        factory.conditions.map((cond) => this.evaluateConditions(cond, context))
      );
      const results = evaluatedConditions.flatMap(({ allowed }) => allowed);
      const allowed =
        factory.type === 'AND' ? results.every(Boolean) : results.some(Boolean);

      return {
        allowed,
        relationTuple: evaluatedConditions.flatMap(
          ({ relationTuple }) => relationTuple
        ),
      };
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const factories =
        getOryPermissionChecks(this.reflector, context.getHandler()) ?? [];
      if (!factories?.length) {
        return true;
      }
      const { postCheck, unauthorizedFactory } = this.options;
      for (const factory of factories) {
        const { allowed, relationTuple } = await this.evaluateConditions(
          factory,
          context
        );

        if (postCheck) {
          postCheck.bind(this)(relationTuple, allowed);
        }
        if (!allowed) {
          throw unauthorizedFactory.bind(this)(
            context,
            new Error(`Unauthorized access for ${relationTuple}`)
          );
        }
      }
      return true;
    }
  }
  return mixin(AuthorizationGuard);
};
