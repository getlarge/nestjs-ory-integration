import { relationTupleToString } from './relation-tuple-parser';

export class SubjectSet {
  namespace: string;
  object: string;
  relation?: string;
  constructor(namespace: string, object: string, relation?: string) {
    this.namespace = namespace;
    this.object = object;
    this.relation = relation;
  }

  toString(): string {
    return `${this.namespace}:${this.object}${
      this.relation ? `#${this.relation}` : ''
    }`;
  }
}

export interface IRelationTuple {
  namespace: string;
  object: string;
  relation: string;
  subjectIdOrSet: string | SubjectSet;
}

export class RelationTuple implements IRelationTuple {
  namespace: string;
  object: string;
  relation: string;
  subjectIdOrSet: string | SubjectSet;

  constructor(
    namespace: string,
    object: string,
    relation: string,
    subjectIdOrSet: string | SubjectSet
  ) {
    this.namespace = namespace;
    this.object = object;
    this.relation = relation;
    this.subjectIdOrSet = subjectIdOrSet;
  }

  toString(): string {
    return relationTupleToString(this);
  }
}
