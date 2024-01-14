import {
  createPermissionCheckQuery,
  RelationTuple,
} from '@getlarge/keto-relations-parser';
import {
  CanActivate,
  ExecutionContext,
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
}

export const OryAuthorizationGuard = (
  options: OryAuthorizationGuardOptions = {}
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
      for (const { relationTupleFactory } of factories) {
        const relationTuple = relationTupleFactory(context);
        const result = createPermissionCheckQuery(relationTuple);
        if (result.hasError()) {
          if (options.errorFactory) {
            throw options.errorFactory(result.error);
          }
          return false;
        }
        const { data } = await this.oryService.checkPermission(result.value);
        const isPermitted = data.allowed;
        if (options.postCheck) {
          options.postCheck(relationTuple, isPermitted);
        }
        if (!isPermitted) {
          return false;
        }
      }
      return true;
    }
  }
  return mixin(AuthorizationGuard);
};
