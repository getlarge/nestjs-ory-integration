import { OryBaseService } from '@getlarge/base-client-wrapper';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosHeaders } from 'axios';

import {
  IAuthorizationGuard,
  OryAuthorizationGuard,
} from './ory-authorization.guard';
import { EnhancedRelationTupleFactory } from './ory-permission-checks.decorator';
import {
  OryPermissionsModuleOptions,
  OryPermissionsService,
} from './ory-permissions';

const mockAxiosResponse = <D = object>(data: D) => {
  return {
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      url: 'http://localhost',
      headers: new AxiosHeaders(),
    },
    data,
  };
};

describe('OryAuthorizationGuard', () => {
  let oryPermissionsService: OryPermissionsService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryPermissionsService,
        {
          provide: OryPermissionsModuleOptions,
          useValue: { basePath: 'http://localhost' },
        },
        {
          provide: OryBaseService,
          useValue: {
            axios: {
              request: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    oryPermissionsService = module.get(OryPermissionsService);
    reflector = module.get(Reflector);
  });

  describe('evaluateConditions', () => {
    let oryAuthorizationGuard: IAuthorizationGuard;
    let context: ExecutionContext;

    beforeEach(() => {
      context = {} as ExecutionContext; // Mock execution context
      const guardFactory = OryAuthorizationGuard({});
      oryAuthorizationGuard = new guardFactory(
        reflector,
        oryPermissionsService
      );
    });

    it('should allow access for a single permitted relation tuple', async () => {
      const factory = () => 'user:123#access@resource:456';
      jest
        .spyOn(oryPermissionsService, 'batchCheckPermission')
        .mockResolvedValue(mockAxiosResponse({ results: [{ allowed: true }] }));

      const result = await oryAuthorizationGuard.evaluateConditions(
        factory,
        context
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny access if one relation in AND condition is not permitted', async () => {
      const factory = {
        type: 'AND',
        conditions: [
          () => 'user:123#access@resource:456',
          () => 'user:123#access@resource:789',
        ],
      } satisfies EnhancedRelationTupleFactory;
      jest
        .spyOn(oryPermissionsService, 'batchCheckPermission')
        .mockResolvedValueOnce(
          mockAxiosResponse({
            results: [{ allowed: false }, { allowed: true }],
          })
        );

      const result = await oryAuthorizationGuard.evaluateConditions(
        factory,
        context
      );
      expect(result.allowed).toBe(false);
    });

    it('should allow access if one relation in OR condition is permitted', async () => {
      const factory = {
        type: 'OR',
        conditions: [
          () => 'user:123#access@resource:456',
          () => 'user:123#access@resource:789',
        ],
      } satisfies EnhancedRelationTupleFactory;
      jest
        .spyOn(oryPermissionsService, 'batchCheckPermission')
        .mockResolvedValueOnce(
          mockAxiosResponse({
            results: [{ allowed: false }, { allowed: true }],
          })
        );

      const result = await oryAuthorizationGuard.evaluateConditions(
        factory,
        context
      );
      expect(result.allowed).toBe(true);
    });

    it('should correctly evaluate nested AND/OR conditions - 1', async () => {
      const factory = {
        type: 'AND',
        conditions: [
          {
            type: 'OR',
            conditions: [
              () => 'user:123#access@resource:456',
              () => 'user:123#access@resource:789',
            ],
          },
          () => 'user:123#access@resource:101',
        ],
      } satisfies EnhancedRelationTupleFactory;
      jest
        .spyOn(oryPermissionsService, 'batchCheckPermission')
        .mockResolvedValueOnce(
          mockAxiosResponse({
            results: [{ allowed: true }, { allowed: false }, { allowed: true }],
          })
        );

      const result = await oryAuthorizationGuard.evaluateConditions(
        factory,
        context
      );
      expect(result.allowed).toBe(true);
    });

    it('should correctly evaluate nested AND/OR conditions - 2', async () => {
      const factory = {
        type: 'AND',
        conditions: [
          {
            type: 'OR',
            conditions: [
              () => 'user:123#access@resource:456',
              () => 'user:123#access@resource:789',
            ],
          },
          () => 'user:123#access@resource:101',
        ],
      } satisfies EnhancedRelationTupleFactory;
      jest
        .spyOn(oryPermissionsService, 'batchCheckPermission')
        .mockResolvedValueOnce(
          mockAxiosResponse({
            results: [
              { allowed: false },
              { allowed: false },
              { allowed: true },
            ],
          })
        );

      const result = await oryAuthorizationGuard.evaluateConditions(
        factory,
        context
      );
      expect(result.allowed).toBe(false);
    });

    it('should correctly evaluate nested AND/OR conditions - 3', async () => {
      const factory = {
        type: 'AND',
        conditions: [
          {
            type: 'OR',
            conditions: [
              () => 'user:123#access@resource:456',
              () => 'user:123#access@resource:789',
            ],
          },
          () => 'user:123#access@resource:101',
        ],
      } satisfies EnhancedRelationTupleFactory;
      jest
        .spyOn(oryPermissionsService, 'batchCheckPermission')
        .mockResolvedValueOnce(
          mockAxiosResponse({
            results: [
              { allowed: true },
              { allowed: false },
              { allowed: false },
            ],
          })
        );

      const result = await oryAuthorizationGuard.evaluateConditions(
        factory,
        context
      );
      expect(result.allowed).toBe(false);
    });

    it('should correctly evaluate nested AND/OR conditions - 4', async () => {
      const factory = {
        type: 'AND',
        conditions: [
          {
            type: 'OR',
            conditions: [
              {
                type: 'OR',
                conditions: [
                  () => 'user:123#access@resource:456',
                  () => 'user:123#access@resource:457',
                ],
              },
              {
                type: 'AND',
                conditions: [
                  () => 'user:123#access@resource:459',
                  () => 'user:123#access@resource:460',
                ],
              },
            ],
          },
          () => 'user:123#access@resource:101',
        ],
      } satisfies EnhancedRelationTupleFactory;
      jest
        .spyOn(oryPermissionsService, 'batchCheckPermission')
        .mockResolvedValueOnce(
          mockAxiosResponse({
            results: [
              { allowed: true },
              { allowed: false },
              { allowed: false },
              { allowed: false },
              { allowed: true },
            ],
          })
        );

      const result = await oryAuthorizationGuard.evaluateConditions(
        factory,
        context
      );
      expect(result.allowed).toBe(true);
    });

    it('should correctly evaluate nested AND/OR conditions - 5', async () => {
      const factory = {
        type: 'AND',
        conditions: [
          {
            type: 'OR',
            conditions: [
              {
                type: 'OR',
                conditions: [
                  () => 'user:123#access@resource:456',
                  () => 'user:123#access@resource:457',
                ],
              },
              {
                type: 'AND',
                conditions: [
                  () => 'user:123#access@resource:459',
                  () => 'user:123#access@resource:460',
                ],
              },
            ],
          },
          () => 'user:123#access@resource:101',
        ],
      } satisfies EnhancedRelationTupleFactory;
      jest
        .spyOn(oryPermissionsService, 'batchCheckPermission')
        .mockResolvedValueOnce(
          mockAxiosResponse({
            results: [
              { allowed: true },
              { allowed: false },
              { allowed: true },
              { allowed: true },
              { allowed: true },
            ],
          })
        );

      const result = await oryAuthorizationGuard.evaluateConditions(
        factory,
        context
      );
      expect(result.allowed).toBe(true);
    });
  });
});
