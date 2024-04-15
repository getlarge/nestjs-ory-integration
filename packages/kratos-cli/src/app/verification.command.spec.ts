import { OryFrontendService } from '@getlarge/kratos-client-wrapper';
import { TestingModule } from '@nestjs/testing';
import { Configuration } from '@ory/client';
import { CommandTestFactory } from 'nest-commander-testing';

import { AppModule } from './app.module';

class MockOryFrontendService {
  createNativeVerificationFlow = jest.fn();
  updateVerificationFlow = jest.fn();
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

describe('VerificationCommand', () => {
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
    it('should trigger verification flow with code method', async () => {
      const email = 'test@test.it';
      const method = 'code';
      oryFrontendService.createNativeVerificationFlow = jest
        .fn()
        .mockResolvedValue({
          data: {
            id: 'flow-id',
          },
        });
      expect(oryFrontendService.config.basePath).toBe('http://localhost');
      await expect(
        CommandTestFactory.run(app, [
          'verify',
          '--email',
          email,
          '--method',
          method,
          '--basePath',
          'http://localhost:4433',
        ])
      ).resolves.toBeUndefined();

      expect(oryFrontendService.config.basePath).toBe('http://localhost:4433');
      expect(
        oryFrontendService.createNativeVerificationFlow
      ).toHaveBeenCalled();
      expect(oryFrontendService.updateVerificationFlow).toHaveBeenCalledWith({
        flow: 'flow-id',
        updateVerificationFlowBody: {
          email,
          method: 'code',
        },
      });
    });
  });
});
