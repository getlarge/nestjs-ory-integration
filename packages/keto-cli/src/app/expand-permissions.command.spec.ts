import { OryPermissionsService } from '@getlarge/keto-client-wrapper';
import { createExpandPermissionQuery } from '@getlarge/keto-relations-parser';
import { Configuration } from '@ory/client';
import { CommandTestFactory } from 'nest-commander-testing';

import { ExpandPermissionsCommand } from './expand-permissions.command';

class MockOryPermissionsService {
  expandPermissions = jest.fn();
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

describe('ExpandPermissionsCommand', () => {
  let service: ExpandPermissionsCommand;
  let oryPermissionsService: OryPermissionsService;

  beforeAll(async () => {
    const app = await CommandTestFactory.createTestingCommand({
      imports: [],
      providers: [
        {
          provide: OryPermissionsService,
          useClass: MockOryPermissionsService,
        },
        ExpandPermissionsCommand,
      ],
    }).compile();

    service = app.get(ExpandPermissionsCommand);
    oryPermissionsService = app.get(OryPermissionsService);
  });

  describe('run', () => {
    it('should process tuple and check permission', async () => {
      const tuple = {
        namespace: 'Group',
        object: 'admin',
        relation: 'members',
      };
      const expectedQuery = createExpandPermissionQuery(tuple).unwrapOrThrow();
      oryPermissionsService.expandPermissions = jest.fn().mockResolvedValue({
        data: {
          type: 'union',
        },
      });

      expect(oryPermissionsService.config.basePath).toBe('http://localhost');
      await expect(
        service.run(
          [
            '--tuple',
            'Group:admin#members',
            '--basePath',
            'http://localhost:4466',
          ],
          {
            tuple: expectedQuery,
            depth: 3,
            basePath: 'http://localhost:4466',
          }
        )
      ).resolves.toBeUndefined();

      expect(oryPermissionsService.config.basePath).toBe(
        'http://localhost:4466'
      );
      expect(oryPermissionsService.expandPermissions).toHaveBeenCalledWith({
        ...expectedQuery,
        maxDepth: 3,
      });
    });
  });
});
