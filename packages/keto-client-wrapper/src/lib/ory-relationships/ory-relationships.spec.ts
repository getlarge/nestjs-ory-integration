import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Test, TestingModule } from '@nestjs/testing';

import { OryRelationshipsModuleOptions } from './ory-relationships.interfaces';
import { OryRelationshipsService } from './ory-relationships.service';

describe('OryRelationshipsService', () => {
  let oryRelationshipsService: OryRelationshipsService;
  let oryBaseService: OryBaseService;
  const accessToken = 'ory_st_test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryRelationshipsService,
        {
          provide: OryRelationshipsModuleOptions,
          useValue: {
            basePath: 'http://localhost',
            accessToken,
          },
        },
        {
          provide: OryBaseService,
          useValue: {
            axios: {
              defaults: {},
              request: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    oryRelationshipsService = module.get<OryRelationshipsService>(
      OryRelationshipsService
    );
    oryBaseService = module.get<OryBaseService>(OryBaseService);
  });

  it('should be defined', () => {
    expect(oryRelationshipsService).toBeDefined();
  });

  describe('Should use custom axios instance', () => {
    it('should call getRelationships endpoint', async () => {
      const result = { data: 'test' };
      const relationQuery = {
        namespace: 'namespace',
        object: 'object',
        relation: 'relation',
      };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      await oryRelationshipsService.getRelationships(relationQuery);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost/relation-tuples?namespace=${relationQuery.namespace}&object=${relationQuery.object}&relation=${relationQuery.relation}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    });

    it('should call createRelationship endpoint', async () => {
      const result = { data: 'test' };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      const payload = {
        createRelationshipBody: {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
        },
      };
      await oryRelationshipsService.createRelationship(payload);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost/admin/relation-tuples`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: JSON.stringify(payload.createRelationshipBody),
      });
    });
  });
});
