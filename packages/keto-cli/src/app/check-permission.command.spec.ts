import { OryPermissionsService } from '@getlarge/keto-client-wrapper';
import {
  createPermissionCheckQuery,
  IRelationTuple,
} from '@getlarge/keto-relations-parser';
import { Configuration } from '@ory/client';
import { CommandTestFactory } from 'nest-commander-testing';

import { CheckPermissionCommand } from './check-permission.command';

class MockOryPermissionsService {
  checkPermission = jest.fn();
  configuration = new Configuration({
    basePath: 'http://localhost',
  });
  get config(): Configuration {
    return this.configuration;
  }
  set config(config: Configuration) {
    this.configuration = config;
  }
}

describe('CheckPermissionCommand', () => {
  let service: CheckPermissionCommand;
  let oryPermissionsService: OryPermissionsService;

  beforeAll(async () => {
    const app = await CommandTestFactory.createTestingCommand({
      imports: [],
      providers: [
        {
          provide: OryPermissionsService,
          useClass: MockOryPermissionsService,
        },
        CheckPermissionCommand,
      ],
    }).compile();

    service = app.get(CheckPermissionCommand);
    oryPermissionsService = app.get(OryPermissionsService);
  });

  describe('run', () => {
    it('should process tuple and check permission', async () => {
      const tuple: IRelationTuple = {
        namespace: 'Group',
        object: 'admin',
        relation: 'members',
        subjectIdOrSet: {
          namespace: 'User',
          object: '1',
        },
      };
      const expectedQuery = createPermissionCheckQuery(tuple).unwrapOrThrow();
      oryPermissionsService.checkPermission = jest.fn().mockResolvedValue({
        data: {
          allowed: true,
        },
      });

      expect(oryPermissionsService.config.basePath).toBe('http://localhost');
      await expect(
        service.run(
          [
            '--tuple',
            'Group:admin#members@User:1',
            '--basePath',
            'http://localhost:4466',
          ],
          {
            tuple: expectedQuery,
            basePath: 'http://localhost:4466',
          }
        )
      ).resolves.toBeUndefined();

      expect(oryPermissionsService.config.basePath).toBe(
        'http://localhost:4466'
      );
      expect(oryPermissionsService.checkPermission).toHaveBeenCalledWith(
        expectedQuery
      );
    });
  });
});
