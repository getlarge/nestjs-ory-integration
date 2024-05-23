import { CustomErrorConstructor, defekt } from 'defekt';

export type RelationTupleSyntaxErrorDetail = {
  wholeInput: string;
  line: number;
  charPositionInLine: number;
  offendingSymbol?: string;
};

const Defekt: CustomErrorConstructor<
  {
    errors: Array<RelationTupleSyntaxErrorDetail>;
  },
  'RelationTupleSyntaxError'
> = defekt({ code: 'RelationTupleSyntaxError' });

export class RelationTupleSyntaxError extends Defekt {}
