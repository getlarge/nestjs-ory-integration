import { defekt } from 'defekt';

export type TupleToPermissionErrorDetail = {
  tuple: unknown;
};

export class TupleToPermissionError extends defekt<
  { errors: Array<TupleToPermissionErrorDetail> },
  'TupleToPermissionError'
>({
  code: 'TupleToPermissionError',
}) {}
