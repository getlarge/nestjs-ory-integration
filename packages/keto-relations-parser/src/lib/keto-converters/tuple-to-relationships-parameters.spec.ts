import { RelationTuple } from '../relation-tuple';
import { RelationTupleWithReplacements } from '../with-replacements/relation-tuple-with-replacements';
import { ReplacementValues } from '../with-replacements/replacement-values';
import {
  createFlattenRelationQuery,
  createRelationQuery,
  createRelationship,
} from './tuple-to-relationships-parameters';

describe('Tuple to relationships parameters', () => {
  let tuple: RelationTuple;
  let tupleWithReplacements: RelationTupleWithReplacements<ReplacementValues>;
  let replacements: {
    namespace: string;
    object: string;
    relation: string;
    subject: string;
  };

  beforeEach(() => {
    tuple = {
      namespace: 'namespace',
      object: 'object',
      relation: 'relation',
      subjectIdOrSet: 'subject',
    };

    replacements = {
      namespace: 'replaced_namespace',
      object: 'replaced_object',
      relation: 'replaced_relation',
      subject: 'replaced_subject',
    };

    tupleWithReplacements = {
      namespace: function () {
        return replacements.namespace;
      },
      object: function () {
        return replacements.object;
      },
      relation: function () {
        return replacements.relation;
      },
      subjectIdOrSet: function () {
        return replacements.subject;
      },
    };
  });

  describe('createRelationQuery', () => {
    it('should create a RelationQuery from a RelationTuple', () => {
      const result = createRelationQuery(tuple);
      expect(result.hasError()).toBe(false);
      expect(result.hasValue()).toBe(true);
      expect(result.unwrapOrThrow()).toEqual({
        namespace: tuple.namespace,
        object: tuple.object,
        relation: tuple.relation,
        subject_id: tuple.subjectIdOrSet,
      });
    });

    it('should create a RelationQuery from a RelationTupleWithReplacements', () => {
      const result = createRelationQuery(tupleWithReplacements, replacements);
      expect(result.hasError()).toBe(false);
      expect(result.hasValue()).toBe(true);
      expect(result.unwrapOrThrow()).toEqual({
        namespace: replacements.namespace,
        object: replacements.object,
        relation: replacements.relation,
        subject_id: replacements.subject,
      });
    });
  });

  describe('createFlattenRelationQuery', () => {
    it('should create a flattened RelationQuery from a RelationTuple with a subjectId', () => {
      const result = createFlattenRelationQuery(tuple);
      expect(result.hasError()).toBe(false);
      expect(result.hasValue()).toBe(true);
      expect(result.hasValue() && result.value).toEqual({
        namespace: tuple.namespace,
        object: tuple.object,
        relation: tuple.relation,
        subjectId: tuple.subjectIdOrSet,
      });
    });

    it('should create a flattened RelationQuery from a RelationTuple with a subjectSet', () => {
      const result = createFlattenRelationQuery({
        ...tuple,
        subjectIdOrSet: { namespace: 'namespace', object: 'object' },
      });
      expect(result.hasError()).toBe(false);
      expect(result.hasValue()).toBe(true);
      expect(result.hasValue() && result.value).toEqual({
        namespace: tuple.namespace,
        object: tuple.object,
        relation: tuple.relation,
        subjectSetNamespace: 'namespace',
        subjectSetObject: 'object',
        subjectSetRelation: '',
      });
    });

    it('should create a flattened RelationQuery from a RelationTupleWithReplacements', () => {
      const result = createFlattenRelationQuery(
        tupleWithReplacements,
        replacements
      );
      expect(result.hasError()).toBe(false);
      expect(result.hasValue()).toBe(true);
      expect(result.unwrapOrThrow()).toEqual({
        namespace: replacements.namespace,
        object: replacements.object,
        relation: replacements.relation,
        subjectId: replacements.subject,
      });
    });
  });

  describe('createRelationship', () => {
    it('should create a Relationship from a RelationTuple with a subjectId', () => {
      const result = createRelationship(tuple as RelationTuple);
      expect(result.hasError()).toBe(false);
      expect(result.hasValue()).toBe(true);
      expect(result.unwrapOrThrow()).toEqual({
        namespace: tuple.namespace,
        object: tuple.object,
        relation: tuple.relation,
        subject_id: tuple.subjectIdOrSet,
      });
    });

    it('should create a Relationship from a RelationTupleWithReplacements', () => {
      const result = createRelationship(
        tupleWithReplacements as RelationTupleWithReplacements<ReplacementValues>,
        replacements
      );
      expect(result.hasError()).toBe(false);
      expect(result.hasValue()).toBe(true);
      expect(result.unwrapOrThrow()).toEqual({
        namespace: replacements.namespace,
        object: replacements.object,
        relation: replacements.relation,
        subject_id: replacements.subject,
      });
    });
  });
});
