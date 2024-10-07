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
import { Relationship } from '@ory/client';
import type { Observable } from 'rxjs';

import {
  EnhancedRelationTupleFactory,
  getOryPermissionChecks,
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
    factory: EnhancedRelationTupleFactory,
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
    ): { tuple: Relationship; relation: string; type: 'AND' | 'OR' }[] {
      const { unauthorizedFactory } = this.options;

      if (typeof factory === 'string' || typeof factory === 'function') {
        const relationTuple =
          typeof factory === 'string' ? factory : factory(context);
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
            type: parentType || 'AND',
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

    async evaluateConditions(
      factory: EnhancedRelationTupleFactory,
      context: ExecutionContext
    ): Promise<EvaluationResult> {
      const { unauthorizedFactory } = this.options;
      const flattenedConditions = this.flattenConditions(factory, context);
      const tuples = flattenedConditions.map(({ tuple }) => tuple);

      try {
        const { data } = await this.oryService
          .batchCheckPermission({
            batchCheckPermissionBody: { tuples },
            maxDepth: this.options.maxDepth,
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });

        const results = data.results;
        const evaluationResult: EvaluationResult = {
          results: {},
          allowed: false,
        };
        let index = 0;
        function replaceWithResults(
          condition: EnhancedRelationTupleFactory
        ): EnhancedNestedCondition {
          if (
            typeof condition === 'string' ||
            typeof condition === 'function'
          ) {
            const { allowed } = results[index];
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
