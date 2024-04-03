import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  RelationTuple,
} from '@getlarge/keto-relations-parser';
import { Configuration } from '@ory/client';
import { CommandTestFactory } from 'nest-commander-testing';

import { DeleteRelationCommand } from './delete-relation.command';

class MockOryRelationshipsService {
  deleteRelationships = jest.fn();
  configuration = new Configuration({
    basePath: 'http://localhost',
    accessToken: '',
  });
  get config(): Configuration {
    return this.configuration;
  }
  set config(config: Configuration) {
    this.configuration = config;
  }
}

describe('DeleteRelationCommand', () => {
  let service: DeleteRelationCommand;
  let oryRelationshipsService: OryRelationshipsService;

  beforeAll(async () => {
    const app = await CommandTestFactory.createTestingCommand({
      imports: [],
      providers: [
        {
          provide: OryRelationshipsService,
          useClass: MockOryRelationshipsService,
        },
        DeleteRelationCommand,
      ],
    }).compile();

    service = app.get(DeleteRelationCommand);
    oryRelationshipsService = app.get(OryRelationshipsService);
  });

  describe('run', () => {
    it('should process tuple and delete relationship', async () => {
      const tuple: RelationTuple = {
        namespace: 'Group',
        object: 'admin',
        relation: 'members',
        subjectIdOrSet: {
          namespace: 'User',
          object: '1',
        },
      };
      const expectedQuery = createRelationQuery(tuple).unwrapOrThrow();
      oryRelationshipsService.deleteRelationships = jest
        .fn()
        .mockResolvedValue({
          data: {
            namespace: 'Group',
            object: 'admin',
            relation: 'members',
            subject_set: {
              relation: '',
              namespace: 'User',
              object: '1',
            },
          },
        });

      expect(oryRelationshipsService.config.basePath).toBe('http://localhost');
      await expect(
        service.run(
          [
            '--tuple',
            'Group:admin#members@User:1',
            '--basePath',
            'http://localhost:4467',
          ],
          {
            tuple: expectedQuery,
            basePath: 'http://localhost:4467',
          }
        )
      ).resolves.toBeUndefined();

      expect(oryRelationshipsService.config.basePath).toBe(
        'http://localhost:4467'
      );
      expect(oryRelationshipsService.deleteRelationships).toHaveBeenCalledWith(
        expectedQuery
      );
    });
  });
});
