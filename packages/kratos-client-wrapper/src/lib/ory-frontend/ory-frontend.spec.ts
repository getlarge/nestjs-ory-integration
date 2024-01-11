import { Test, TestingModule } from '@nestjs/testing';
import { OryFrontendService } from './ory-frontend.service';
import { OryBaseService } from '@getlarge/base-client-wrapper';
import { OryFrontendModuleOptions } from './ory-frontend.interfaces';

describe('OryFrontendService', () => {
  let oryFrontendService: OryFrontendService;
  let oryBaseService: OryBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryFrontendService,
        {
          provide: OryFrontendModuleOptions,
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

    oryFrontendService = module.get<OryFrontendService>(OryFrontendService);
    oryBaseService = module.get<OryBaseService>(OryBaseService);
  });

  it('should be defined', () => {
    expect(oryFrontendService).toBeDefined();
  });

  describe('Should use custom axios instance', () => {
    it('should call getLoginFlow endpoint', async () => {
      const result = { data: 'test' };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      await oryFrontendService.getLoginFlow({ id: 'test' });
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: 'http://localhost/self-service/login/flows?id=test',
        method: 'GET',
        headers: {},
      });
    });

    it('should call createBrowserLoginFlow endpoint', async () => {
      const result = { data: 'test' };
      const returnTo = 'value';
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      const payload = { returnTo };
      await oryFrontendService.createBrowserLoginFlow(payload);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost/self-service/login/browser?return_to=${returnTo}`,
        method: 'GET',
        headers: {},
      });
    });
  });
});
