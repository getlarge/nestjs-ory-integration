import { OryFrontendService } from '@getlarge/kratos-client-wrapper';
import { TestingModule } from '@nestjs/testing';
import { Configuration } from '@ory/client';
import { CommandTestFactory } from 'nest-commander-testing';

import { AppModule } from './app.module';

class MockOryFrontendService {
  createNativeLoginFlow = jest.fn();
  updateLoginFlow = jest.fn();
  toSession = jest.fn();
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

describe('LoginCommand', () => {
  let oryFrontendService: OryFrontendService;
  let app: TestingModule;

  beforeAll(async () => {
    app = await CommandTestFactory.createTestingCommand({
      imports: [AppModule],
      providers: [],
    })
      .overrideProvider(OryFrontendService)
      .useClass(MockOryFrontendService)
      .compile();

    oryFrontendService = app.get(OryFrontendService);
  });

  describe('run', () => {
    it('should use credentials to sign in and return session token', async () => {
      const email = 'test@test.it';
      const password = 'password';
      const sessionToken = 'ory_st_xxxxx';
      oryFrontendService.createNativeLoginFlow = jest.fn().mockResolvedValue({
        data: {
          id: 'flow-id',
        },
      });
      oryFrontendService.updateLoginFlow = jest.fn().mockResolvedValue({
        data: {
          session_token: sessionToken,
        },
      });

      expect(oryFrontendService.config.basePath).toBe('http://localhost');
      CommandTestFactory.setAnswers([password]);
      await expect(
        CommandTestFactory.run(app, [
          'login',
          '--email',
          email,
          '--basePath',
          'http://localhost:4433',
        ])
      ).resolves.toBeUndefined();

      expect(oryFrontendService.config.basePath).toBe('http://localhost:4433');
      expect(oryFrontendService.createNativeLoginFlow).toHaveBeenCalled();
      expect(oryFrontendService.updateLoginFlow).toHaveBeenCalledWith({
        flow: 'flow-id',
        updateLoginFlowBody: {
          method: 'password',
          identifier: email,
          password,
        },
      });
      expect(oryFrontendService.toSession).toHaveBeenCalledWith({
        xSessionToken: sessionToken,
      });
    });
  });
});
