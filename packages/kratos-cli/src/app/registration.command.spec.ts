import { OryFrontendService } from '@getlarge/kratos-client-wrapper';
import { TestingModule } from '@nestjs/testing';
import { Configuration } from '@ory/client';
import { CommandTestFactory } from 'nest-commander-testing';

import { AppModule } from './app.module';

class MockOryFrontendService {
  createNativeRegistrationFlow = jest.fn();
  updateRegistrationFlow = jest.fn();
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

describe('RegistrationCommand', () => {
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
    it('should register user and create identity', async () => {
      const email = 'test@test.it';
      const password = 'password';
      oryFrontendService.createNativeRegistrationFlow = jest
        .fn()
        .mockResolvedValue({
          data: {
            id: 'flow-id',
          },
        });
      oryFrontendService.updateRegistrationFlow = jest.fn().mockResolvedValue({
        data: {
          identity: {
            id: 'identity-id',
          },
        },
      });

      expect(oryFrontendService.config.basePath).toBe('http://localhost');
      CommandTestFactory.setAnswers([password]);
      await expect(
        CommandTestFactory.run(app, [
          'register',
          '--email',
          email,
          '--basePath',
          'http://localhost:4433',
        ])
      ).resolves.toBeUndefined();

      expect(oryFrontendService.config.basePath).toBe('http://localhost:4433');
      expect(
        oryFrontendService.createNativeRegistrationFlow
      ).toHaveBeenCalled();
      expect(oryFrontendService.updateRegistrationFlow).toHaveBeenCalledWith({
        flow: 'flow-id',
        updateRegistrationFlowBody: {
          traits: { email },
          password,
          method: 'password',
        },
      });
    });
  });
});
