/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createPermissionCheckQuery,
  createExpandPermissionQuery,
} from './tuple-to-permissions-parameters';
import { RelationTuple } from '../relation-tuple';
import { TupleToPermissionError } from '../errors/tuple-to-permission.error';

describe('Tuple to permissions parameters', () => {
  describe('createPermissionCheckQuery', () => {
    it('should return a PermissionApiCheckPermissionRequest for a valid RelationTuple', () => {
      const tuple: RelationTuple = {
        namespace: 'namespace',
        object: 'object',
        relation: 'relation',
        subjectIdOrSet: 'subject',
      };

      const result = createPermissionCheckQuery(tuple);

      expect(result.hasValue()).toBe(true);
      expect(result.unwrapOrThrow()).toEqual({
        namespace: tuple.namespace,
        object: tuple.object,
        relation: tuple.relation,
        subjectId: tuple.subjectIdOrSet,
      });
    });

    it('should return a TupleToPermissionError for an invalid RelationTuple', () => {
      const tuple: any = {
        namespace: 'namespace',
        object: 'object',
      };

      const result = createPermissionCheckQuery(tuple);

      expect(result.hasError()).toBe(true);
      expect(result.unwrapErrorOrThrow()).toBeInstanceOf(
        TupleToPermissionError
      );
    });
  });

  describe('createExpandPermissionQuery', () => {
    it('should return a PermissionApiExpandPermissionsRequest for a valid RelationTuple', () => {
      const tuple: RelationTuple = {
        namespace: 'namespace',
        object: 'object',
        relation: 'relation',
        subjectIdOrSet: 'subject',
      };

      const result = createExpandPermissionQuery(tuple);

      expect(result.hasValue()).toBe(true);
      expect(result.unwrapOrThrow()).toEqual({
        namespace: tuple.namespace,
        object: tuple.object,
        relation: tuple.relation,
      });
    });

    it('should return a TupleToPermissionError for an invalid RelationTuple', () => {
      const tuple: any = {
        namespace: 'namespace',
        object: 'object',
      };

      const result = createExpandPermissionQuery(tuple);

      expect(result.hasError()).toBe(true);
      expect(result.unwrapErrorOrThrow()).toBeInstanceOf(
        TupleToPermissionError
      );
    });
  });
});
