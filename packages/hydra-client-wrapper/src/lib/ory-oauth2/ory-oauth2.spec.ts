import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Test, TestingModule } from '@nestjs/testing';
import { OAuth2ApiCreateOAuth2ClientRequest } from '@ory/client';

import { OryOAuth2ModuleOptions } from './ory-oauth2.interfaces';
import { OryOAuth2Service } from './ory-oauth2.service';

describe('OryOAuth2Service', () => {
  let oryOAuth2Service: OryOAuth2Service;
  let oryBaseService: OryBaseService;
  const accessToken = 'ory_st_test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryOAuth2Service,
        {
          provide: OryOAuth2ModuleOptions,
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

    oryOAuth2Service = module.get(OryOAuth2Service);
    oryBaseService = module.get<OryBaseService>(OryBaseService);
  });

  it('should be defined', () => {
    expect(oryOAuth2Service).toBeDefined();
  });

  describe('Should use custom axios instance', () => {
    it('should call getOAuth2Client ednpoint', async () => {
      const result = { data: 'test' };
      const id = 'test';
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      await oryOAuth2Service.getOAuth2Client({ id });
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost:4445/admin/clients/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    });

    it('should call createOAuth2Client endpoint', async () => {
      const result = { data: 'test' };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      const params: OAuth2ApiCreateOAuth2ClientRequest = {
        oAuth2Client: {
          client_id: 'test',
        },
      };
      await oryOAuth2Service.createOAuth2Client(params);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost:4445/admin/clients`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: JSON.stringify(params.oAuth2Client),
      });
    });
  });
});
