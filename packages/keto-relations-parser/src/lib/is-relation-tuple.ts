import type { RelationTuple } from './relation-tuple';
import { RelationTupleWithReplacements } from './with-replacements/relation-tuple-with-replacements';
import { ReplacementValues } from './with-replacements/replacement-values';

export function isRelationTuple(x: unknown): x is RelationTuple {
  return (
    typeof x === 'object' &&
    x != null &&
    'namespace' in x &&
    typeof x.namespace === 'string' &&
    'object' in x &&
    typeof x.object === 'string' &&
    'relation' in x &&
    typeof x.relation === 'string'
  );
}

export function isRelationTupleWithReplacements<T extends ReplacementValues>(
  x: unknown
): x is RelationTupleWithReplacements<T> {
  return (
    typeof x === 'object' &&
    x != null &&
    'namespace' in x &&
    typeof x.namespace === 'function' &&
    'object' in x &&
    typeof x.object === 'function' &&
    'relation' in x &&
    typeof x.relation === 'function'
  );
}
