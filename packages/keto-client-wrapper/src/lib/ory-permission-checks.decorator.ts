import { CustomDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  parseRelationTuple,
  RelationTuple,
} from '@getlarge/keto-relations-parser';

type OryPermissionCheckMetadataType = {
  relationTupleFactory: (ctx: ExecutionContext) => RelationTuple;
};

const ORY_PERMISSION_CHECKS_METADATA_KEY = Symbol('OryPermissionChecksKey');

export const OryPermissionChecks = (
  ...relationTupleFactories: (string | ((ctx: ExecutionContext) => string))[]
): CustomDecorator<typeof ORY_PERMISSION_CHECKS_METADATA_KEY> => {
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
