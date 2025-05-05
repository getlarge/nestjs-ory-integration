import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Test, TestingModule } from '@nestjs/testing';
import { JwkApiCreateJsonWebKeySetRequest } from '@ory/client';

import { OryJwkModuleOptions } from './ory-jwk.interfaces';
import { OryJwkService } from './ory-jwk.service';

describe('OryJwkService', () => {
  let oryJwkService: OryJwkService;
  let oryBaseService: OryBaseService;
  const accessToken = 'ory_st_test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryJwkService,
        {
          provide: OryJwkModuleOptions,
          useValue: {
            basePath: 'http://localhost:4445',
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

    oryJwkService = module.get(OryJwkService);
    oryBaseService = module.get<OryBaseService>(OryBaseService);
  });

  it('should be defined', () => {
    expect(OryJwkService).toBeDefined();
  });

  describe('Should use custom axios instance', () => {
    it('should call getJsonWebKey endpoint', async () => {
      const result = { data: 'test' };
      const set = 'test';
      const kid = 'test';
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      await oryJwkService.getJsonWebKey({ set, kid });
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost:4445/admin/keys/${set}/${kid}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    });

    it('should call createJsonWebKeySet endpoint', async () => {
      const result = { data: 'test' };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      const params: JwkApiCreateJsonWebKeySetRequest = {
        set: 'test',
        createJsonWebKeySet: {
          kid: 'test',
          use: 'sig',
          alg: 'RS256',
        },
      };
      await oryJwkService.createJsonWebKeySet(params);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost:4445/admin/keys/${params.set}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: JSON.stringify(params.createJsonWebKeySet),
      });
    });
  });
});
