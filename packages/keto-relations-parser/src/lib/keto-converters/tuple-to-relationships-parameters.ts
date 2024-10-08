import type { RelationQuery, Relationship } from '@ory/client';
import { error, Result, value } from 'defekt';

import { TupleToRelationshipError } from '../errors/tuple-to-relationship.error';
import { UnknownError } from '../errors/unknown.error';
import {
  isRelationTuple,
  isRelationTupleWithReplacements,
} from '../is-relation-tuple';
import { RelationTuple } from '../relation-tuple';
import { get } from '../util/get';
import { RelationTupleWithReplacements } from '../with-replacements/relation-tuple-with-replacements';
import { ReplacementValues } from '../with-replacements/replacement-values';

type RelationQueryFlat = Omit<RelationQuery, 'subject_set' | 'subject_id'> & {
  subjectSetNamespace?: string;
  subjectSetObject?: string;
  subjectSetRelation?: string;
  subjectId?: string;
};

const omitBy = <T extends object>(
  obj: T,
  predicate: (value: unknown) => boolean
): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => !predicate(value))
  ) as T;

const resolveTupleProperty = <
  T extends ReplacementValues,
  U extends Partial<RelationTuple | RelationTupleWithReplacements<T>>
>(
  property: string,
  tuple: U,
  replacements?: U extends RelationTupleWithReplacements<T> ? T : never
): string | undefined => {
  const factory = get(tuple, property as keyof U);
  if (typeof factory === 'function') {
    return factory(replacements ?? ({} as T));
  }
  if (typeof factory === 'string') {
    return factory;
  }
  return undefined;
};

export function createRelationQuery(
  tuple: Partial<RelationTuple>
): Result<RelationQuery, UnknownError>;
export function createRelationQuery<T extends ReplacementValues>(
  tuple: Partial<RelationTupleWithReplacements<T>>,
  replacements: T
): Result<RelationQuery, UnknownError>;
export function createRelationQuery<
  T extends ReplacementValues,
  U extends Partial<RelationTuple | RelationTupleWithReplacements<T>>
>(
  tuple: U,
  replacements?: U extends RelationTupleWithReplacements<T> ? T : never
): Result<RelationQuery, UnknownError> {
  const { subjectIdOrSet } = tuple;
  const result: RelationQuery = {};

  try {
    result.namespace = resolveTupleProperty('namespace', tuple, replacements);
    result.object = resolveTupleProperty('object', tuple, replacements);
    result.relation = resolveTupleProperty('relation', tuple, replacements);

    if (typeof subjectIdOrSet === 'object' && subjectIdOrSet) {
      result.subject_set = omitBy(
        {
          namespace:
            resolveTupleProperty(
              'subjectIdOrSet.namespace',
              tuple,
              replacements
            ) ?? '',
          object:
            resolveTupleProperty(
              'subjectIdOrSet.object',
              tuple,
              replacements
            ) ?? '',
          relation:
            resolveTupleProperty(
              'subjectIdOrSet.relation',
              tuple,
              replacements
            ) ?? '',
        },
        (v) => v === undefined || v === null
      ) as unknown as RelationQuery['subject_set'];
    } else if (typeof subjectIdOrSet === 'string') {
      result.subject_id =
        resolveTupleProperty('subjectIdOrSet', tuple, replacements) ?? '';
    }

    return value(omitBy(result, (v) => v === undefined || v === null));
  } catch (e) {
    return error(new UnknownError({ data: e }));
  }
}

export function createFlattenRelationQuery(
  tuple: Partial<RelationTuple>
): Result<RelationQueryFlat, UnknownError>;
export function createFlattenRelationQuery<T extends ReplacementValues>(
  tuple: Partial<RelationTupleWithReplacements<T>>,
  replacements: T
): Result<RelationQueryFlat, UnknownError>;
export function createFlattenRelationQuery<
  T extends ReplacementValues,
  U extends Partial<RelationTuple | RelationTupleWithReplacements<T>>
>(
  tuple: U,
  replacements?: U extends RelationTupleWithReplacements<T> ? T : never
): Result<RelationQueryFlat, UnknownError> {
  const { subjectIdOrSet } = tuple;
  const result: RelationQueryFlat = {};
  try {
    result.namespace = resolveTupleProperty('namespace', tuple, replacements);
    result.object = resolveTupleProperty('object', tuple, replacements);
    result.relation = resolveTupleProperty('relation', tuple, replacements);

    if (typeof subjectIdOrSet === 'object' && subjectIdOrSet) {
      result.subjectSetObject =
        resolveTupleProperty('subjectIdOrSet.object', tuple, replacements) ??
        '';
      result.subjectSetNamespace =
        resolveTupleProperty('subjectIdOrSet.namespace', tuple, replacements) ??
        '';
      result.subjectSetRelation =
        resolveTupleProperty('subjectIdOrSet.relation', tuple, replacements) ??
        '';
    } else if (typeof subjectIdOrSet === 'string') {
      result.subjectId =
        resolveTupleProperty('subjectIdOrSet', tuple, replacements) ?? '';
    }

    return value(omitBy(result, (v) => v === undefined || v === null));
  } catch (e) {
    return error(new UnknownError({ data: e }));
  }
}

export function createRelationship(
  tuple: RelationTuple
): Result<Relationship, TupleToRelationshipError | UnknownError>;
export function createRelationship<T extends ReplacementValues>(
  tuple: RelationTupleWithReplacements<T>,
  replacements: T
): Result<Relationship, TupleToRelationshipError | UnknownError>;
export function createRelationship<T extends ReplacementValues>(
  tuple: RelationTuple | RelationTupleWithReplacements<T>,
  opt_replacements?: T
): Result<Relationship, TupleToRelationshipError | UnknownError>;
export function createRelationship<
  T extends ReplacementValues,
  U extends RelationTuple | RelationTupleWithReplacements<T>
>(
  tuple: U,
  opt_replacements?: U extends RelationTupleWithReplacements<T> ? T : never
): Result<Relationship, TupleToRelationshipError | UnknownError> {
  if (isRelationTuple(tuple)) {
    const result: Relationship = {
      namespace: tuple.namespace,
      object: tuple.object,
      relation: tuple.relation,
    };

    if (typeof tuple.subjectIdOrSet === 'string') {
      result.subject_id = tuple.subjectIdOrSet;
    } else if (typeof tuple.subjectIdOrSet === 'object') {
      result.subject_set = {
        ...tuple.subjectIdOrSet,
        relation: tuple.subjectIdOrSet.relation ?? '',
      };
    }

    return value(result);
  }
  if (isRelationTupleWithReplacements(tuple)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const replacements: T = opt_replacements!; // cannot be null

    const result: Relationship = {
      namespace: tuple.namespace(replacements),
      object: tuple.object(replacements),
      relation: tuple.relation(replacements),
    };

    if (typeof tuple.subjectIdOrSet === 'function') {
      result.subject_id = tuple.subjectIdOrSet(replacements);
    } else if (typeof tuple.subjectIdOrSet === 'object') {
      result.subject_set = {
        namespace: tuple.subjectIdOrSet.namespace(replacements),
        object: tuple.subjectIdOrSet.object(replacements),
        relation: tuple.subjectIdOrSet.relation(replacements) ?? '',
      };
    }

    return value(result);
  }

  return error(
    new TupleToRelationshipError({
      data: {
        errors: [{ tuple }],
      },
    })
  );
}
