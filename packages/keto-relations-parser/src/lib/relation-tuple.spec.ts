import { RelationTupleBuilder } from './relation-tuple';

describe('RelationTupleBuilder', () => {
  let builder: RelationTupleBuilder;

  beforeEach(() => {
    builder = new RelationTupleBuilder();
  });

  it('should create an instance', () => {
    expect(builder).toBeDefined();
  });

  it('should throw error when setting empty relation', () => {
    expect(() => {
      builder.relation = '';
    }).toThrow('relation cannot be empty');
  });

  it('should throw error when setting relation with forbidden characters', () => {
    expect(() => {
      builder.relation = 'relation@';
    }).toThrow('relation cannot contain any of the following characters: :@#');
  });

  it('should set and get relation', () => {
    builder.relation = 'relation';
    expect(builder.relation).toBe('relation');
  });

  it('should throw error when setting empty namespace', () => {
    expect(() => {
      builder.namespace = '';
    }).toThrow('namespace cannot be empty');
  });

  it('should throw error when setting namespace with forbidden characters', () => {
    expect(() => {
      builder.namespace = 'namespace@';
    }).toThrow('namespace cannot contain any of the following characters: :@#');
  });

  it('should set and get namespace', () => {
    builder.namespace = 'namespace';
    expect(builder.namespace).toBe('namespace');
  });

  it('should throw error when setting empty object', () => {
    expect(() => {
      builder.object = '';
    }).toThrow('object cannot be empty');
  });

  it('should throw error when setting object with forbidden characters', () => {
    expect(() => {
      builder.object = 'object@';
    }).toThrow('object cannot contain any of the following characters: :@#');
  });

  it('should set and get object', () => {
    builder.object = 'object';
    expect(builder.object).toBe('object');
  });

  it('should throw error when setting empty subjectIdOrSet', () => {
    expect(() => {
      builder.subjectIdOrSet = '';
    }).toThrow('subjectIdOrSet cannot be empty');
  });

  it('should throw error when setting subjectIdOrSet with forbidden characters', () => {
    expect(() => {
      builder.subjectIdOrSet = 'subjectIdOrSet@';
    }).toThrow(
      'subjectIdOrSet cannot contain any of the following characters: :@#'
    );
  });

  it('should set and get subjectIdOrSet', () => {
    builder.subjectIdOrSet = 'subjectIdOrSet';
    expect(builder.subjectIdOrSet).toBe('subjectIdOrSet');
  });

  it('should throw error when setting empty relation tuple', () => {
    expect(() => {
      builder.isIn('').of('', '');
    }).toThrow('relation cannot be empty');
  });

  it('should build a relation tuple string with only subjectId', () => {
    builder.subject('subjectId').isIn('relation').of('namespace', 'object');
    expect(builder.toString()).toBe('namespace:object#relation@subjectId');
  });

  it('should build a relation tuple string with subjectSet', () => {
    builder
      .subject('subjectNamespace', 'subjectObject', 'subjectRelation')
      .isIn('relation')
      .of('namespace', 'object');
    expect(builder.toString()).toBe(
      'namespace:object#relation@subjectNamespace:subjectObject#subjectRelation'
    );
  });

  it('should build a human readable relation tuple string with subjectId', () => {
    builder.subject('subjectId').isIn('relation').of('namespace', 'object');
    expect(builder.toHumanReadableString()).toBe(
      'subjectId is in relation of namespace:object'
    );
  });

  it('should build a human readable relation tuple string with subjectSet', () => {
    builder
      .subject('subjectNamespace', 'subjectObject', 'subjectRelation')
      .isIn('relation')
      .of('namespace', 'object');
    expect(builder.toHumanReadableString()).toBe(
      'subjectRelation of subjectNamespace:subjectObject is in relation of namespace:object'
    );
  });
});
