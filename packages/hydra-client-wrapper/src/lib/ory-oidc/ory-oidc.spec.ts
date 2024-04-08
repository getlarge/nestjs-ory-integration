import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Test, TestingModule } from '@nestjs/testing';
import { OidcApiCreateOidcDynamicClientRequest } from '@ory/client';

import { OryOidcModuleOptions } from './ory-oidc.interfaces';
import { OryOidcService } from './ory-oidc.service';

describe('OryOidcService', () => {
  let oryOidcService: OryOidcService;
  let oryBaseService: OryBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryOidcService,
        {
          provide: OryOidcModuleOptions,
          useValue: { basePath: 'http://localhost:4444' },
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

    oryOidcService = module.get<OryOidcService>(OryOidcService);
    oryBaseService = module.get<OryBaseService>(OryBaseService);
  });

  it('should be defined', () => {
    expect(OryOidcService).toBeDefined();
  });

  describe('Should use custom axios instance', () => {
    it('should call getOidcDynamicClient endpoint', async () => {
      const result = { data: 'test' };
      const params = {
        id: 'test',
      };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      await oryOidcService.getOidcDynamicClient(params, {
        params,
      });
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost:4444/oauth2/register/${params.id}`,
        method: 'GET',
        headers: {},
        params: {
          id: params.id,
        },
      });
    });

    it('should call createOidcDynamicClient endpoint', async () => {
      const result = { data: 'test' };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      const params: OidcApiCreateOidcDynamicClientRequest = {
        oAuth2Client: {
          access_token_strategy: 'opaque',
          scope: 'read:users',
        },
      };
      await oryOidcService.createOidcDynamicClient(params);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost:4444/oauth2/register`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params.oAuth2Client),
      });
    });
  });
});
