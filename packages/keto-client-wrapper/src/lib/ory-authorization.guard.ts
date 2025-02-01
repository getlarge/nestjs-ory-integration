import {
  createRelationship,
  parseRelationTuple,
} from '@getlarge/keto-relations-parser';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type {
  PermissionApiExpandPermissionsRequest,
  Relationship,
} from '@ory/client';
import type { Observable } from 'rxjs';

import {
  EnhancedRelationTupleFactory,
  getOryPermissionChecks,
  RelationTupleCondition,
  RelationTupleFactory,
} from './ory-permission-checks.decorator';
import { OryPermissionsService } from './ory-permissions';

type EvaluationResult = {
  results: {
    [tuple: string]: {
      allowed: boolean;
      parentType: 'AND' | 'OR' | null;
    };
  };
  allowed: boolean;
};

export interface OryAuthorizationGuardOptions {
  maxDepth: number;
  postCheck?: (this: IAuthorizationGuard, result: EvaluationResult) => void;
  unauthorizedFactory: (
    this: IAuthorizationGuard,
    ctx: ExecutionContext,
    error: unknown
  ) => Error;
}

export type NestedCondition = {
  type: 'AND' | 'OR';
  conditions: (boolean | NestedCondition)[];
};

export type EnhancedNestedCondition = boolean | NestedCondition;

export abstract class IAuthorizationGuard implements CanActivate {
  abstract options: OryAuthorizationGuardOptions;
  abstract canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean>;

  abstract evaluateConditions(
    factory: RelationTupleFactory | RelationTupleCondition,
    context: ExecutionContext
  ): Promise<EvaluationResult>;
}

const defaultOptions: OryAuthorizationGuardOptions = {
  unauthorizedFactory: () => {
    return new ForbiddenException();
  },
  maxDepth: 3,
};

export const OryAuthorizationGuard = (
  options: Partial<OryAuthorizationGuardOptions> = {}
): Type<IAuthorizationGuard> => {
  @Injectable()
  class AuthorizationGuard implements CanActivate {
    constructor(
      readonly reflector: Reflector,
      readonly oryService: OryPermissionsService
    ) {}

    get options(): OryAuthorizationGuardOptions {
      return {
        ...defaultOptions,
        ...options,
      };
    }

    private flattenConditions(
      factory: EnhancedRelationTupleFactory,
      context: ExecutionContext,
      parentType: 'AND' | 'OR' | null = null
    ): { tuple: Relationship; relation: string; type: 'AND' | 'OR' | null }[] {
      const { unauthorizedFactory } = this.options;

      if (typeof factory === 'string' || typeof factory === 'function') {
        const relationTuple =
          typeof factory === 'string' ? factory : factory(context);
        if (typeof relationTuple !== 'string') {
          return this.flattenConditions(relationTuple, context, parentType);
        }
        const result = createRelationship(
          parseRelationTuple(relationTuple).unwrapOrThrow()
        );

        if (result.hasError()) {
          throw unauthorizedFactory.bind(this)(context, result.error);
        }

        return [
          {
            tuple: result.value,
            relation: relationTuple,
            type: parentType || null,
          },
        ];
      }

      return factory.conditions.flatMap((cond) =>
        this.flattenConditions(cond, context, factory.type)
      );
    }

    private evaluateLogicalStructure(
      condition: EnhancedNestedCondition
    ): boolean {
      if (typeof condition === 'boolean') {
        return condition;
      }
      if (condition.type === 'AND') {
        return condition.conditions.every((cond) => {
          if (typeof cond === 'boolean') {
            return cond;
          }
          return this.evaluateLogicalStructure(cond);
        });
      } else if (condition.type === 'OR') {
        return condition.conditions.some((cond) => {
          if (typeof cond === 'boolean') {
            return cond;
          }
          return this.evaluateLogicalStructure(cond);
        });
      }
      return false; // Fallback, should not reach here
    }

    private constructEvaluationResult(
      factory: EnhancedRelationTupleFactory,
      flattenedConditions: ReturnType<AuthorizationGuard['flattenConditions']>,
      permissionResults: boolean[]
    ): EvaluationResult {
      const evaluationResult: EvaluationResult = {
        results: {},
        allowed: false,
      };
      let index = 0;

      function replaceWithResults(
        condition: EnhancedRelationTupleFactory
      ): EnhancedNestedCondition {
        if (typeof condition === 'string' || typeof condition === 'function') {
          const allowed = permissionResults[index];
          const { relation, type } = flattenedConditions[index];
          evaluationResult.results[relation] = {
            allowed,
            parentType: type,
          };
          index++;
          return allowed;
        }

        return {
          type: condition.type,
          conditions: condition.conditions.map(replaceWithResults),
        };
      }

      const logicalStructure = replaceWithResults(factory);
      evaluationResult.allowed =
        this.evaluateLogicalStructure(logicalStructure);

      return evaluationResult;
    }

    async evaluateConditions(
      factory: EnhancedRelationTupleFactory,
      context: ExecutionContext
    ): Promise<EvaluationResult> {
      const { unauthorizedFactory } = this.options;
      const flattenedConditions = this.flattenConditions(factory, context);
      const partialTuples: { tuple: Relationship; index: number }[] = [];
      const fullTuples: { tuple: Relationship; index: number }[] = [];

      flattenedConditions.forEach(({ tuple }, index) => {
        if (!tuple.subject_id && !tuple.subject_set) {
          partialTuples.push({ tuple, index });
        } else {
          fullTuples.push({ tuple, index });
        }
      });

      const permissionResults: boolean[] = new Array(
        flattenedConditions.length
      ).fill(false);

      try {
        for (const { tuple, index } of partialTuples) {
          /**
           * !experimental and counter-inituitive: to use with care
           * We check that this resolves to no children, meaning that the object has no relations with any subject => it is public
           */
          const { data } = await this.oryService.expandPermissions(
            tuple as PermissionApiExpandPermissionsRequest
          );
          /**
           * This Keto API endpoint has a quirk,it returns {code: 404, ... } when relation is not found
           * ? maybe the check should be more complex based on data.type or data.children[n].type
           **/
          permissionResults[index] =
            !data.children || data.children.length === 0;
        }

        const { data } = await this.oryService.batchCheckPermission({
          batchCheckPermissionBody: {
            tuples: fullTuples.map(({ tuple }) => tuple),
          },
          maxDepth: this.options.maxDepth,
        });

        fullTuples.forEach(({ index }, arrayIndex) => {
          permissionResults[index] = data.results[arrayIndex].allowed;
        });

        const evaluationResult = this.constructEvaluationResult(
          factory,
          flattenedConditions,
          permissionResults
        );

        return evaluationResult;
      } catch (error) {
        throw unauthorizedFactory.bind(this)(context, error);
      }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const factories =
        getOryPermissionChecks(this.reflector, context.getHandler()) ?? [];
      if (!factories?.length) {
        return true;
      }
      const { postCheck, unauthorizedFactory } = this.options;
      for (const factory of factories) {
        const evaluation = await this.evaluateConditions(factory, context);

        if (postCheck) {
          postCheck.bind(this)(evaluation);
        }
        if (!evaluation.allowed) {
          throw unauthorizedFactory.bind(this)(
            context,
            new Error(`Unauthorized access`)
          );
        }
      }
      return true;
    }
  }
  return mixin(AuthorizationGuard);
};
