import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const ORY_PERMISSION_CHECKS_METADATA_KEY = Symbol('OryPermissionChecksKey');

export type RelationTupleFactory = string | ((ctx: ExecutionContext) => string);

export type RelationTupleCondition = {
  type: 'AND' | 'OR';
  conditions: (RelationTupleFactory | RelationTupleCondition)[];
};

export type EnhancedRelationTupleFactory =
  | RelationTupleFactory
  | RelationTupleCondition;

/**
 * @description Decorator to add permission checks to a handler, will be consumed by the `OryAuthorizationGuard` {@link OryAuthorizationGuard} using the `getOryPermissionChecks` {@link getOryPermissionChecks} function
 * @param relationTupleFactories
 * @returns
 */
export const OryPermissionChecks = (
  ...relationTupleFactories: EnhancedRelationTupleFactory[]
) => {
  return SetMetadata(
    ORY_PERMISSION_CHECKS_METADATA_KEY,
    relationTupleFactories
  );
};

export const getOryPermissionChecks = (
  reflector: Reflector,
  handler: Parameters<Reflector['get']>[1]
): EnhancedRelationTupleFactory[] | null => {
  const oryPermissions =
    reflector.get<
      EnhancedRelationTupleFactory[],
      typeof ORY_PERMISSION_CHECKS_METADATA_KEY
    >(ORY_PERMISSION_CHECKS_METADATA_KEY, handler) ?? [];
  return oryPermissions.length > 0 ? oryPermissions : null;
};
