import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Identity } from '@ory/client';
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { join, resolve } from 'node:path';
import request from 'supertest';

import { OryFrontendModule, OryFrontendService } from '../src/lib/ory-frontend';
import {
  OryIdentitiesModule,
  OryIdentitiesService,
} from '../src/lib/ory-identities';
import { ExampleController } from './app.controller.mock';
import { ExampleService } from './app.service.mock';

describe('Kratos client wrapper E2E', () => {
  let app: INestApplication;
  let oryFrontendService: OryFrontendService;
  let oryIdentityService: OryIdentitiesService;
  const dockerComposeFile = resolve(join(__dirname, 'docker-compose.yaml'));
  const route = '/Example';

  const register = async (
    email: string,
    password: string
  ): Promise<Identity> => {
    const { data: registrationFlow } =
      await oryFrontendService.createNativeRegistrationFlow();

    const { data } = await oryFrontendService.updateRegistrationFlow({
      flow: registrationFlow.id,
      updateRegistrationFlowBody: {
        traits: { email },
        password,
        method: 'password',
      },
    });
    return data.identity;
  };

  const login = async (email: string, password: string): Promise<string> => {
    const { data: loginFlow } =
      await oryFrontendService.createNativeLoginFlow();

    const { data } = await oryFrontendService.updateLoginFlow({
      flow: loginFlow.id,
      updateLoginFlowBody: {
        password,
        identifier: email,
        method: 'password',
      },
    });
    return data.session_token as string;
  };

  const createOryUser = async (
    email: string,
    password: string
  ): Promise<{ identity: Identity; sessionToken: string }> => {
    const identity = await register(email, password);
    const response = await oryIdentityService.getIdentity({
      id: identity.id,
    });
    expect(response.data.id).toEqual(identity.id);
    const sessionToken = await login(email, password);
    return { identity, sessionToken };
  };

  beforeAll(() => {
    if (!process.env['CI']) {
      execSync(`docker-compose -f ${dockerComposeFile} up -d --wait`, {
        stdio: 'ignore',
      });
    }
  });

  afterAll(() => {
    if (!process.env['CI']) {
      execSync(`docker-compose -f ${dockerComposeFile} down`, {
        stdio: 'ignore',
      });
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        OryFrontendModule.forRoot({
          basePath: 'http://localhost:44330',
        }),
        OryIdentitiesModule.forRootAsync({
          useFactory: () => ({
            basePath: 'http://localhost:44340',
            accessToken: '',
          }),
        }),
      ],
      providers: [ExampleService],
      controllers: [ExampleController],
    }).compile();

    oryFrontendService = module.get(OryFrontendService);
    oryIdentityService = module.get(OryIdentitiesService);

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    return app?.close();
  });

  it('should successfully authenticate user when it is registered in Ory Kratos', async () => {
    const password = randomBytes(8).toString('hex');
    const email = `${randomBytes(8).toString('hex')}@example.com`;
    const { sessionToken } = await createOryUser(email, password);

    const { body } = await request(app.getHttpServer())
      .get(route)
      .set({
        Authorization: `Bearer ${sessionToken}`,
      });

    expect(body).toEqual({ message: 'OK' });
  });

  it('should fail to authenticate user when it is not registered in Ory Kratos', async () => {
    const { body } = await request(app.getHttpServer())
      .get(route)
      .set({
        Authorization: `Bearer ory_st_${randomBytes(8).toString('hex')}`,
      });
    expect(body).toEqual({
      error: 'Forbidden',
      message: 'Forbidden resource',
      statusCode: 403,
    });
  });
});
