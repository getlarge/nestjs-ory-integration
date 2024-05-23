import { CustomErrorConstructor, defekt } from 'defekt';

export type TupleToRelationshipErrorDetail = {
  tuple: unknown;
};

const Defekt: CustomErrorConstructor<
  {
    errors: Array<TupleToRelationshipErrorDetail>;
  },
  'TupleToRelationshipError'
> = defekt({
  code: 'TupleToRelationshipError',
});

export class TupleToRelationshipError extends Defekt {}
