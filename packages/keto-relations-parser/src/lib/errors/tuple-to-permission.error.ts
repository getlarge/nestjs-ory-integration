import { CustomErrorConstructor, defekt } from 'defekt';

export type TupleToPermissionErrorDetail = {
  tuple: unknown;
};

const Defekt: CustomErrorConstructor<
  {
    errors: Array<TupleToPermissionErrorDetail>;
  },
  'TupleToPermissionError'
> = defekt({
  code: 'TupleToPermissionError',
});

export class TupleToPermissionError extends Defekt {}
