import {
  createPermissionCheckQuery,
  RelationTuple,
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

import { getOryPermissionChecks } from './ory-permission-checks.decorator';
import { OryPermissionsService } from './ory-permissions';

export interface OryAuthorizationGuardOptions {
  errorFactory?: (error: Error) => Error;
  postCheck?: (relationTuple: RelationTuple, isPermitted: boolean) => void;
  unauthorizedFactory: (ctx: ExecutionContext, error: unknown) => Error;
}

const defaultOptions: OryAuthorizationGuardOptions = {
  unauthorizedFactory: () => {
    return new ForbiddenException();
  },
};

export const OryAuthorizationGuard = (
  options: Partial<OryAuthorizationGuardOptions> = {}
): Type<CanActivate> => {
  @Injectable()
  class AuthorizationGuard implements CanActivate {
    constructor(
      readonly reflector: Reflector,
      readonly oryService: OryPermissionsService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const factories =
        getOryPermissionChecks(this.reflector, context.getHandler()) ?? [];
      if (!factories?.length) {
        return true;
      }
      const { postCheck, unauthorizedFactory } = {
        ...defaultOptions,
        ...options,
      };
      for (const { relationTupleFactory } of factories) {
        const relationTuple = relationTupleFactory(context);
        const result = createPermissionCheckQuery(relationTuple);
        if (result.hasError()) {
          throw unauthorizedFactory(context, result.error);
        }
        let isPermitted = false;
        try {
          const { data } = await this.oryService.checkPermission(result.value);
          isPermitted = data.allowed;
        } catch (error) {
          throw unauthorizedFactory(context, error);
        }
        if (postCheck) {
          postCheck(relationTuple, isPermitted);
        }
        if (!isPermitted) {
          throw unauthorizedFactory(
            context,
            new Error(`Unauthorized access for ${relationTuple.toString()}`)
          );
        }
      }
      return true;
    }
  }
  return mixin(AuthorizationGuard);
};
