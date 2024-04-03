import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Test, TestingModule } from '@nestjs/testing';

import { OryIdentitiesModuleOptions } from './ory-identities.interfaces';
import { OryIdentitiesService } from './ory-identities.service';

describe('OryIdentitiesService', () => {
  let oryIdentitiesService: OryIdentitiesService;
  let oryBaseService: OryBaseService;
  const accessToken = 'ory_st_test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryIdentitiesService,
        {
          provide: OryIdentitiesModuleOptions,
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

    oryIdentitiesService =
      module.get<OryIdentitiesService>(OryIdentitiesService);
    oryBaseService = module.get<OryBaseService>(OryBaseService);
  });

  it('should be defined', () => {
    expect(oryIdentitiesService).toBeDefined();
  });

  describe('Should use custom axios instance', () => {
    it('should call getIdentity ednpoint', async () => {
      const result = { data: 'test' };
      const id = 'test';
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      await oryIdentitiesService.getIdentity({ id });
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost/admin/identities/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    });

    it('should call createIdentity endpoint', async () => {
      const result = { data: 'test' };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      const payload = {
        createIdentityBody: {
          schema_id: 'default',
          traits: {
            email: '',
          },
        },
      };
      await oryIdentitiesService.createIdentity(payload);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost/admin/identities`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: JSON.stringify(payload.createIdentityBody),
      });
    });
  });
});
