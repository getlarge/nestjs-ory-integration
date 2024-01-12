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

export class RelationTuple {
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

export class RelationTupleBuilder {
  private readonly forbiddenCharacters = /[:@#]/g;
  private tuple: RelationTuple;

  constructor() {
    this.tuple = new RelationTuple('', '', '', '');
  }

  private validateInput(key: keyof RelationTuple, value: string) {
    if (!value) {
      throw new Error(`${key} cannot be empty`);
    }
    if (this.forbiddenCharacters.test(value)) {
      throw new Error(
        `${key} cannot contain any of the following characters: :@#`
      );
    }
  }

  get relation(): string {
    return this.tuple.relation;
  }

  set relation(relation: string) {
    this.validateInput('relation', relation);
    this.tuple.relation = relation;
  }

  get namespace(): string {
    return this.tuple.namespace;
  }

  set namespace(namespace: string) {
    this.validateInput('namespace', namespace);
    this.tuple.namespace = namespace;
  }

  get object(): string {
    return this.tuple.object;
  }

  set object(object: string) {
    this.validateInput('object', object);
    this.tuple.object = object;
  }

  get subjectIdOrSet(): string | SubjectSet {
    return this.tuple.subjectIdOrSet;
  }

  set subjectIdOrSet(subjectIdOrSet: string | SubjectSet) {
    if (typeof subjectIdOrSet === 'string') {
      this.validateInput('subjectIdOrSet', subjectIdOrSet);
    } else {
      this.validateInput('namespace', subjectIdOrSet.namespace);
      this.validateInput('object', subjectIdOrSet.object);
      if (subjectIdOrSet.relation) {
        this.validateInput('relation', subjectIdOrSet.relation);
      }
    }
    this.tuple.subjectIdOrSet = subjectIdOrSet;
  }

  isIn(relation: string): this {
    this.relation = relation;
    return this;
  }

  of(namespace: string, object: string): this {
    this.namespace = namespace;
    this.object = object;
    return this;
  }

  subject(subjectId: string): this;
  subject(namespace: string, object: string): this;
  subject(namespace: string, object: string, relation: string): this;
  subject(
    namespaceOrSubjectId: string,
    object?: string,
    relation?: string
  ): this {
    if (object) {
      this.subjectIdOrSet = new SubjectSet(
        namespaceOrSubjectId,
        object,
        relation
      );
    } else {
      this.subjectIdOrSet = namespaceOrSubjectId;
    }
    return this;
  }

  toString(): string {
    return this.tuple.toString();
  }

  /**
   * @description Returns a human readable string
   * @example
   * ```typescript
   * const relationTuple = new RelationTupleBuilder()
   *  .subject('subject_namespace', 'subject_object', 'subject_relation')
   * .of('namespace', 'object')
   * .isIn('relations');
   * relationTuple.toHumanReadableString(); // => subject_relation of subject_namespace:subject_object is in relations of namespace:object
   * ```
   * @returns {string} human readable string
   */
  toHumanReadableString(): string {
    if (typeof this.subjectIdOrSet === 'string') {
      return `${this.subjectIdOrSet} is in ${this.relation} of ${this.namespace}:${this.object}`;
    }
    const { namespace, object, relation } = this.subjectIdOrSet;
    const base = `${namespace}:${object} is in ${this.relation} of ${this.namespace}:${this.object}`;
    return relation ? `${relation} of ${base}` : base;
  }
}
