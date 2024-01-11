import { defekt } from 'defekt';

export type TupleToRelationshipErrorDetail = {
  tuple: unknown;
};

export class TupleToRelationshipError extends defekt<
  { errors: Array<TupleToRelationshipErrorDetail> },
  'TupleToRelationshipError'
>({
  code: 'TupleToRelationshipError',
}) {}
