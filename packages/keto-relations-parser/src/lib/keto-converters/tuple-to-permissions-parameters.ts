import type {
  PermissionApiCheckPermissionRequest,
  PermissionApiExpandPermissionsRequest,
} from '@ory/client';
import { error, Result, value } from 'defekt';

import { TupleToPermissionError } from '../errors/tuple-to-permission.error';
import { UnknownError } from '../errors/unknown.error';
import {
  isRelationTuple,
  isRelationTupleWithReplacements,
} from '../is-relation-tuple';
import { RelationTuple } from '../relation-tuple';
import { RelationTupleWithReplacements } from '../with-replacements/relation-tuple-with-replacements';
import { ReplacementValues } from '../with-replacements/replacement-values';
import { createRelationship } from './tuple-to-relationships-parameters';

type PermissionTuple = Pick<
  RelationTuple,
  'namespace' | 'object' | 'relation'
> &
  Partial<Pick<RelationTuple, 'subjectIdOrSet'>>;

type PermissionTupleWithReplacements<T extends ReplacementValues> = Pick<
  RelationTupleWithReplacements<T>,
  'namespace' | 'object' | 'relation'
> &
  Partial<Pick<RelationTupleWithReplacements<T>, 'subjectIdOrSet'>>;

export function createPermissionCheckQuery(
  tuple: PermissionTuple
): Result<
  PermissionApiCheckPermissionRequest,
  TupleToPermissionError | UnknownError
>;
export function createPermissionCheckQuery<T extends ReplacementValues>(
  tuple: PermissionTupleWithReplacements<T>,
  replacements: T
): Result<
  PermissionApiCheckPermissionRequest,
  TupleToPermissionError | UnknownError
>;
export function createPermissionCheckQuery<T extends ReplacementValues>(
  tuple: PermissionTuple | PermissionTupleWithReplacements<T>,
  replacements?: T
): Result<
  PermissionApiCheckPermissionRequest,
  TupleToPermissionError | UnknownError
> {
  try {
    if (isRelationTuple(tuple)) {
      tuple.subjectIdOrSet = tuple.subjectIdOrSet ?? '';
    } else if (isRelationTupleWithReplacements(tuple)) {
      tuple.subjectIdOrSet =
        tuple.subjectIdOrSet ??
        function () {
          return '';
        };
    } else {
      return error(
        new TupleToPermissionError({
          data: {
            errors: [{ tuple }],
          },
        })
      );
    }

    const relationshipResult = createRelationship(tuple, replacements);
    if (relationshipResult.hasError()) {
      return error(
        new TupleToPermissionError({
          data: {
            errors: [{ tuple }],
          },
        })
      );
    }
    const relationship = relationshipResult.value;
    const result: PermissionApiCheckPermissionRequest = {
      namespace: relationship.namespace,
      object: relationship.object,
      relation: relationship.relation,
    };

    if (relationship.subject_id) {
      Object.defineProperty(result, 'subjectId', {
        value: relationship.subject_id,
        enumerable: true,
      });
      delete relationship.subject_id;
    } else if (relationship.subject_set) {
      Object.defineProperties(result, {
        subjectSetNamespace: {
          value: relationship.subject_set.namespace,
          enumerable: true,
        },
        subjectSetObject: {
          value: relationship.subject_set.object,
          enumerable: true,
        },
        subjectSetRelation: {
          value: relationship.subject_set.relation,
          enumerable: true,
        },
      });
      delete relationship.subject_set;
    }
    return value(result);
  } catch (e) {
    return error(new UnknownError({ data: e }));
  }
}

export function createExpandPermissionQuery<T extends ReplacementValues>(
  tuple: PermissionTuple | PermissionTupleWithReplacements<T>,
  replacements?: T
): Result<
  PermissionApiExpandPermissionsRequest,
  TupleToPermissionError | UnknownError
> {
  try {
    if (isRelationTuple(tuple)) {
      tuple.subjectIdOrSet = tuple.subjectIdOrSet ?? '';
    } else if (isRelationTupleWithReplacements(tuple)) {
      tuple.subjectIdOrSet =
        tuple.subjectIdOrSet ??
        function () {
          return '';
        };
    } else {
      return error(
        new TupleToPermissionError({
          data: {
            errors: [{ tuple }],
          },
        })
      );
    }

    const relationshipResult = createRelationship(tuple, replacements);
    if (relationshipResult.hasError()) {
      return error(
        new TupleToPermissionError({
          data: {
            errors: [{ tuple }],
          },
        })
      );
    }
    const relationship = relationshipResult.value;
    return value({
      namespace: relationship.namespace,
      object: relationship.object,
      relation: relationship.relation,
    });
  } catch (e) {
    return error(new UnknownError({ data: e }));
  }
}
