import { inspect } from 'util';
import { RelationTuple } from './relation-tuple';
import {
  parseRelationTuple,
  relationTupleToString,
} from './relation-tuple-parser';
import { ResultError } from 'defekt/build/lib/Result';
import { RelationTupleSyntaxError } from './errors/relation-tuple-syntax.error';

function nsToMs(ns: bigint): bigint;
function nsToMs(ns: number): number;
function nsToMs(ns: bigint | number): bigint | number {
  if (typeof ns === 'bigint') {
    return ns / BigInt(1_000_000);
  } else {
    return ns / 1_000_000;
  }
}

const generateRelationTuple = (i: number, withSubjectSet: boolean): string => {
  const uuidLengthString = String(i).repeat(36);
  const subjectSet = `${uuidLengthString}:${uuidLengthString}#${uuidLengthString}`;

  if (withSubjectSet) {
    return `${subjectSet}@${subjectSet}`;
  }
  return `${subjectSet}@${uuidLengthString}`;
};

const invalidSyntaxtTestCases = [
  //? i added tolerance to tuple containing only namespace, should this be allowed ?
  // ['asdfhg'],
  ['object#relation'],
  ['object@subject'],
  ['object#relation@subject@sdf'],
  ['object#relation@subjectObject#relation@sdf'],
  ['object#relation@subjectObject#relation'],
  ['namespace:object#relation@subjectObject#relation'],
  ['object#relation@namespace:subjectObject#relation'],
  ['object#relation@subjectId'],
  ['namespace:object#@subjectId'],
  ['namespace:#relation@subjectId'],
  [':object#relation@subjectId'],
  ['namespace:object#relation@'],
  ['namespace:object#relation@:subjectObject#relation'],
  ['namespace:object#relation@namespace:#relation'],
  ['namespace:object#relation@id:'],
  ['namespace::object#relation@id'],
  ['namespace:object##relation@id'],
  ['namespace:object#relation@@id'],
];

describe('parseRelationTuple tests', () => {
  describe(`parses valid RelationTuples`, () => {
    const testCases: [string, RelationTuple][] = [
      [
        'namespace:object#relation@subject',
        {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
          subjectIdOrSet: 'subject',
        },
      ],
      [
        ' namespace:object#relation@subject     ',
        {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
          subjectIdOrSet: 'subject',
        },
      ],
      [
        'namespace:object#relation@(subject)',
        {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
          subjectIdOrSet: 'subject',
        },
      ],
      [
        'namespace:object#relation@subjectNamespace:subjectObject#subjectRelation',
        {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
          subjectIdOrSet: {
            namespace: 'subjectNamespace',
            object: 'subjectObject',
            relation: 'subjectRelation',
          },
        },
      ],
      [
        '  namespace:object#relation@subjectNamespace:subjectObject#subjectRelation ',
        {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
          subjectIdOrSet: {
            namespace: 'subjectNamespace',
            object: 'subjectObject',
            relation: 'subjectRelation',
          },
        },
      ],
      [
        'namespace:object#relation@(subjectNamespace:subjectObject#subjectRelation)',
        {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
          subjectIdOrSet: {
            namespace: 'subjectNamespace',
            object: 'subjectObject',
            relation: 'subjectRelation',
          },
        },
      ],
      [
        'namespace:object#relation@(subjectNamespace:subjectObject)',
        {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
          subjectIdOrSet: {
            namespace: 'subjectNamespace',
            object: 'subjectObject',
          },
        },
      ],
      [
        'namespace:object#relation@(subjectNamespace:subjectObject#)',
        {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
          subjectIdOrSet: {
            namespace: 'subjectNamespace',
            object: 'subjectObject',
          },
        },
      ],
    ];
    it.each(testCases)('%s', (str, expectedRelationTuple) => {
      const result = parseRelationTuple(str);

      expect(result.unwrapOrThrow()).toEqual(expectedRelationTuple);
    });
  });

  describe('performance tests', () => {
    describe('parseRelationTuple', () => {
      it('with subject', () => {
        const relationTuples = Array.from({ length: 100 }, (_, i) =>
          generateRelationTuple(i, false)
        );

        const result = relationTuples.map((tuple) => {
          const start = process.hrtime.bigint();
          const res = parseRelationTuple(tuple);
          const end = process.hrtime.bigint();

          expect(res.unwrapOrThrow()).toBeDefined();

          return end - start;
        });

        const sumInNs = Number(result.reduce((a, b) => a + b, BigInt(0)));
        const avgInNs = Number(sumInNs) / result.length;

        const sumInMs = nsToMs(sumInNs);
        const avgInMs = nsToMs(avgInNs);

        console.info(
          `performance tests :: with subject :: Execution for ${result.length} elements took: ${sumInMs}ms (avg: ${avgInMs}ms)`
        );

        expect(avgInMs).toBeLessThan(0.5);
      });

      it('with subjectSet', () => {
        const relationTuples = Array.from({ length: 100 }, (_, i) =>
          generateRelationTuple(i, true)
        );

        const result = relationTuples.map((tuple) => {
          const start = process.hrtime.bigint();
          const res = parseRelationTuple(tuple);
          const end = process.hrtime.bigint();

          expect(res.unwrapOrThrow()).toBeDefined();

          return end - start;
        });

        const sumInNs = Number(result.reduce((a, b) => a + b, BigInt(0)));
        const avgInNs = Number(sumInNs) / result.length;

        const sumInMs = nsToMs(sumInNs);
        const avgInMs = nsToMs(avgInNs);

        console.info(
          `performance tests :: with subjectSet :: Execution for ${result.length} elements took: ${sumInMs}ms (avg: ${avgInMs}ms)`
        );

        expect(avgInMs).toBeLessThan(0.7);
      });
    });
  });

  describe('rejects wrong syntax', () => {
    it.each(invalidSyntaxtTestCases)('%s', (str) => {
      const result = parseRelationTuple(str);

      if (result.hasError()) {
        const stringifiedError = inspect(result.error, false, 10, true);
        console.warn(`Result has error: `, stringifiedError);
      }

      expect(result.hasError()).toBe(true);
      expect(result.hasValue()).toBe(false);
      expect(
        (result as ResultError<RelationTuple, RelationTupleSyntaxError>).error
      ).toBeInstanceOf(RelationTupleSyntaxError);
    });
  });
});

describe('relationTupleToString tests', () => {
  const testCases: [RelationTuple, string][] = [
    [
      {
        namespace: 'namespace',
        object: 'object',
        relation: 'relation',
        subjectIdOrSet: 'subject',
      },
      'namespace:object#relation@subject',
    ],
    [
      {
        namespace: 'namespace',
        object: 'object',
        relation: 'relation',
        subjectIdOrSet: {
          namespace: 'subjectNamespace',
          object: 'subjectObject',
          relation: 'subjectRelation',
        },
      },
      'namespace:object#relation@subjectNamespace:subjectObject#subjectRelation',
    ],
    [
      {
        namespace: 'namespace',
        object: 'object',
        relation: 'relation',
        subjectIdOrSet: {
          namespace: 'subjectNamespace',
          object: 'subjectObject',
        },
      },
      'namespace:object#relation@subjectNamespace:subjectObject',
    ],
  ];
  it.each(testCases)('%s', (relationTuple, expectedString) => {
    const result = relationTupleToString(relationTuple);

    expect(result).toEqual(expectedString);
  });
});
