import {
  parseRelationTuple,
  RelationTuple,
} from '@getlarge/keto-relations-parser';
import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

type OryPermissionCheckMetadataType = {
  relationTupleFactory: (ctx: ExecutionContext) => RelationTuple;
};

type RelationTupleFactory = string | ((ctx: ExecutionContext) => string);

const ORY_PERMISSION_CHECKS_METADATA_KEY = Symbol('OryPermissionChecksKey');

/**
 * @description Decorator to add permission checks to a handler, will be consumed by the `OryAuthorizationGuard` {@link OryAuthorizationGuard} using the `getOryPermissionChecks` {@link getOryPermissionChecks} function
 * @param relationTupleFactories
 * @returns
 * @todo add `where` argument to allow for more complex permission checks with `where` clauses
 * such as  :
 * - where relationTupleFactories[0] and relationTupleFactories[1] are true
 * - where relationTupleFactories[0] is true or (relationTupleFactories[1] and relationTupleFactories[2]) are true
 */
export const OryPermissionChecks = (
  ...relationTupleFactories: RelationTupleFactory[]
) => {
  const valueToSet: OryPermissionCheckMetadataType[] = [];
  for (const relationTupleFactory of relationTupleFactories) {
    if (typeof relationTupleFactory === 'string') {
      valueToSet.push({
        relationTupleFactory: () =>
          parseRelationTuple(relationTupleFactory).unwrapOrThrow(),
      });
    } else {
      valueToSet.push({
        relationTupleFactory: (ctx) =>
          parseRelationTuple(relationTupleFactory(ctx)).unwrapOrThrow(),
      });
    }
  }
  return SetMetadata(ORY_PERMISSION_CHECKS_METADATA_KEY, valueToSet);
};

export const getOryPermissionChecks = (
  reflector: Reflector,
  handler: Parameters<Reflector['get']>[1]
): OryPermissionCheckMetadataType[] | null => {
  const oryPermissions =
    reflector.get<
      OryPermissionCheckMetadataType[],
      typeof ORY_PERMISSION_CHECKS_METADATA_KEY
    >(ORY_PERMISSION_CHECKS_METADATA_KEY, handler) ?? [];
  return oryPermissions.length > 0 ? oryPermissions : null;
};
