import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  RelationTuple,
} from '@getlarge/keto-relations-parser';
import { Configuration } from '@ory/client';
import { CommandTestFactory } from 'nest-commander-testing';

import { CreateRelationCommand } from './create-relation.command';

class MockOryRelationshipsService {
  createRelationship = jest.fn();
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

describe('CreateRelationCommand', () => {
  let service: CreateRelationCommand;
  let oryRelationshipsService: OryRelationshipsService;

  beforeAll(async () => {
    const app = await CommandTestFactory.createTestingCommand({
      imports: [],
      providers: [
        {
          provide: OryRelationshipsService,
          useClass: MockOryRelationshipsService,
        },
        CreateRelationCommand,
      ],
    }).compile();

    service = app.get(CreateRelationCommand);
    oryRelationshipsService = app.get(OryRelationshipsService);
  });

  describe('run', () => {
    it('should process tuple and create relationship', async () => {
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
      oryRelationshipsService.createRelationship = jest.fn().mockResolvedValue({
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
            'http://localhost:4466',
          ],
          {
            tuple: expectedQuery,
            basePath: 'http://localhost:4466',
          }
        )
      ).resolves.toBeUndefined();

      expect(oryRelationshipsService.config.basePath).toBe(
        'http://localhost:4466'
      );
      expect(oryRelationshipsService.createRelationship).toHaveBeenCalledWith({
        createRelationshipBody: expectedQuery,
      });
    });
  });
});
