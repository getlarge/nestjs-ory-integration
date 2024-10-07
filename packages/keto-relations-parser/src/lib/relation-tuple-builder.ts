import { IRelationTuple, RelationTuple, SubjectSet } from './relation-tuple';
import { parseRelationTuple } from './relation-tuple-parser';

export class RelationTupleBuilder {
  private readonly forbiddenCharacters = /[:@#]/g;
  private tuple: RelationTuple;

  constructor() {
    this.tuple = new RelationTuple('', '', '', '');
  }

  static fromString(relationTupleString: string): RelationTupleBuilder {
    const relationTuple =
      parseRelationTuple(relationTupleString).unwrapOrThrow();
    const { namespace, object, relation, subjectIdOrSet } = relationTuple;
    return new RelationTupleBuilder()
      .subject(subjectIdOrSet)
      .of(namespace, object)
      .isIn(relation);
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

  /**
   * @param relation
   * @returns
   * @description Sets the relation between the subject and the namespace:object
   */
  isIn(relation: string): this {
    this.relation = relation;
    return this;
  }

  /**
   * @alias isIn
   * @param relation
   * @returns
   */
  areIn(relation: string): this {
    return this.isIn(relation);
  }

  /**
   * @alias isIn
   * @param relation
   * @returns
   * @description Alias for isIn
   */
  isAllowedTo(verb: string): this {
    return this.isIn(verb);
  }

  /**
   * @alias isIn
   * @param relation
   * @returns
   * @description Alias for isIn
   */
  areAllowedTo(verb: string): this {
    return this.isIn(verb);
  }

  /**
   * @param namespace
   * @param object
   * @returns
   * @description Sets the namespace and object for the relation tuple
   */
  of(namespace: string, object: string): this {
    this.namespace = namespace;
    this.object = object;
    return this;
  }

  /**
   * @param subjectSet | subjectSet | subjectId | subjectNamespace, subjectObject | subjectNamespace, subjectObject, subjectRelation
   * @returns
   * @description Sets the subject of the relation tuple
   */
  subject(subjectSet: SubjectSet): this;
  subject(subjectId: string): this;
  subject(namespace: string, object: string): this;
  subject(namespace: string, object: string, relation: string): this;
  subject(
    namespaceOrSubjectIdOrSubjectSet: string | SubjectSet,
    object?: string,
    relation?: string
  ): this;
  subject(
    namespaceOrSubjectIdOrSubjectSet: string | SubjectSet,
    object?: string,
    relation?: string
  ): this {
    if (typeof namespaceOrSubjectIdOrSubjectSet === 'object') {
      this.subjectIdOrSet = namespaceOrSubjectIdOrSubjectSet;
      return this;
    }

    if (object) {
      this.subjectIdOrSet = new SubjectSet(
        namespaceOrSubjectIdOrSubjectSet,
        object,
        relation
      );
    } else {
      this.subjectIdOrSet = namespaceOrSubjectIdOrSubjectSet;
    }
    return this;
  }

  /**
   * @description Returns the relation tuple as Zanzibar string notation
   */
  toString(): string {
    return this.tuple.toString();
  }

  /**
   * @description Returns the relation tuple as JSON
   */
  toJSON(): IRelationTuple {
    return {
      namespace: this.namespace,
      object: this.object,
      relation: this.relation,
      subjectIdOrSet: this.subjectIdOrSet,
    };
  }

  // TODO: check if relation is plural
  private get isPlural(): boolean {
    return false;
  }

  // TODO: check if relation is a verb
  private get isVerb(): boolean {
    return this.relation.endsWith('ing');
  }

  private get subjectRelation():
    | 'is in'
    | 'is allowed to'
    | 'are in'
    | 'are allowed to' {
    if (this.isVerb) {
      return this.isPlural ? 'are allowed to' : 'is allowed to';
    }
    return this.isPlural ? 'are in' : 'is in';
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
      return `${this.subjectIdOrSet} ${this.subjectRelation} ${this.relation} of ${this.namespace}:${this.object}`;
    }
    const { namespace, object, relation } = this.subjectIdOrSet;
    const base = `${namespace}:${object} ${this.subjectRelation} ${this.relation} of ${this.namespace}:${this.object}`;
    return relation ? `${relation} of ${base}` : base;
  }
}

export const relationTupleBuilder = (): RelationTupleBuilder =>
  new RelationTupleBuilder();
