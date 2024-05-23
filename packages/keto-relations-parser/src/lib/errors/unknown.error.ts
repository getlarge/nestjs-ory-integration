import { CustomErrorConstructor, defekt } from 'defekt';

const Defekt: CustomErrorConstructor<unknown, 'UnknownError'> = defekt({
  code: 'UnknownError',
});

export class UnknownError extends Defekt {}
