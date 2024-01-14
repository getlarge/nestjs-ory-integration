import { error, Result, value } from 'defekt';

import { RelationTupleSyntaxError } from './errors/relation-tuple-syntax.error';
import { UnknownError } from './errors/unknown.error';
import { RelationTuple } from './relation-tuple';

type Namespace = string;
type TupleObject = string;
type Relation = string;
type SubjectId = string;
type SubjectNamespace = string;
type SubjectObject = string;
type SubjectRelation = string;

type RelationTupleString =
  | `${Namespace}:${TupleObject}`
  | `${Namespace}:${TupleObject}#${Relation}`
  | `${Namespace}:${TupleObject}#${Relation}@${SubjectId}`
  | `${Namespace}:${TupleObject}#${Relation}@${SubjectNamespace}:${SubjectObject}`
  | `${Namespace}:${TupleObject}#${Relation}@${SubjectNamespace}:${SubjectObject}#${SubjectRelation}`
  | `${Namespace}:${TupleObject}#${Relation}@(${SubjectId})`
  | `${Namespace}:${TupleObject}#${Relation}@(${SubjectNamespace}:${SubjectObject})`
  | `${Namespace}:${TupleObject}#${Relation}@(${SubjectNamespace}:${SubjectObject}#${SubjectRelation})`;

/**
 * @description Parses the given string to a {@link RelationTuple} using a Regex
 * str syntax:
 * ```
 * <relation-tuple> ::= <object>'#'relation'@'<subject> | <object>'#'relation'@('<subject>')'
 * <object> ::= namespace':'object_id
 * <subject> ::= subject_id | <subject_set>
 * <subject_set> ::= <object>'#'relation
 * ```
 *
 * @example `object#relation@subject`
 * The characters `:@#()` are reserved for syntax use only (=> forbidden in values)
 *
 * @param str
 * @return The parsed {@link RelationTuple} or {@link RelationTupleSyntaxError} in case of an invalid string.
 */
export function parseRelationTuple(
  input: string
): Result<RelationTuple, RelationTupleSyntaxError | UnknownError> {
  /**
   * parenthesis could be used to group a subject set but are not allowed in any segment
   * so we remove them here as they do not affect the parsing
   */
  const cleanInput = input.replace(/[()]/g, '');

  const regex =
    /^([^:]+)(?::([^#]+))?(?:#([^@]+)(?:@([^:]+)(?::([^#]+))?(?:#([^()]+(?:\([^()]+\))?)?)?)?)?$/;

  const match = regex.exec(cleanInput);
  if (!match) {
    return error(
      new RelationTupleSyntaxError({
        data: {
          errors: [
            {
              wholeInput: input,
              line: 1,
              charPositionInLine: 0,
            },
          ],
        },
      })
    );
  }

  // remove the first element which is the whole match
  match.shift();

  const forbiddenCharacters = /[:@#]/g;
  const matchesWithForbiddenCharacters = match.filter((str) => {
    return new RegExp(forbiddenCharacters).test(str);
  });
  if (matchesWithForbiddenCharacters?.length > 0) {
    return error(
      new RelationTupleSyntaxError({
        data: {
          errors: matchesWithForbiddenCharacters.map((str) => {
            const index = cleanInput.indexOf(str);
            return {
              wholeInput: cleanInput,
              line: 1,
              charPositionInLine: index,
              offendingSymbol: str,
            };
          }),
        },
      })
    );
  }

  const [
    namespace,
    object,
    relation,
    idOrNamespace,
    subjectObject,
    subjectRelation,
  ] = match.map((str) => str?.trim() ?? '');

  try {
    const result: RelationTuple = {
      namespace: namespace,
      object: object,
      relation: relation,
      subjectIdOrSet: '',
    };

    if (subjectRelation) {
      result.subjectIdOrSet = {
        namespace: idOrNamespace,
        object: subjectObject,
        relation: subjectRelation,
      };
    } else if (subjectObject) {
      result.subjectIdOrSet = {
        namespace: idOrNamespace,
        object: subjectObject,
      };
    } else if (idOrNamespace) {
      result.subjectIdOrSet = idOrNamespace;
    }

    return value(result);
  } catch (e) {
    return error(new UnknownError({ data: e }));
  }
}

/**
 * @description Converts a {@link RelationTuple} to a string
 * @example
 * ```typescript
 * const relationTuple = new RelationTuple('namespace', 'object', 'relation', 'subjectId');
 * relationTuple.toString() // => 'namespace:object#relation@subjectId'
 * ```
 *
 * @param tuple
 * @returns
 */
export const relationTupleToString = (
  tuple: Partial<RelationTuple>
): RelationTupleString => {
  const base: `${string}:${string}#${string}` = `${tuple.namespace}:${tuple.object}#${tuple.relation}`;
  if (!tuple.subjectIdOrSet) {
    return base;
  }
  if (typeof tuple.subjectIdOrSet === 'string') {
    return `${base}@${tuple.subjectIdOrSet}`;
  }
  const { namespace, object, relation } = tuple.subjectIdOrSet;
  if (!relation) {
    return `${base}@${namespace}:${object}`;
  }
  return `${base}@${namespace}:${object}#${relation}`;
};
