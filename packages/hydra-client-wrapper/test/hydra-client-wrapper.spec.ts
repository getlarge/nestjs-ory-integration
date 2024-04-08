import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { join, resolve } from 'node:path';
import { Issuer, TokenSet } from 'openid-client';
import request from 'supertest';

import {
  OryOAuth2Module,
  OryOAuth2Service,
  OryOidcModule,
  OryOidcService,
} from '../src';
import { ExampleController } from './app.controller.mock';
import { ExampleService } from './app.service.mock';

describe('Hydra client wrapper E2E', () => {
  let app: INestApplication;
  let oryOAuth2Service: OryOAuth2Service;
  let oryOidcService: OryOidcService;
  const dockerComposeFile = resolve(join(__dirname, 'docker-compose.yaml'));
  const route = '/Example';

  const createOAuth2Client = async (
    email: string
  ): Promise<{ clientId: string; clientSecret: string }> => {
    const { data } = await oryOAuth2Service.createOAuth2Client({
      oAuth2Client: {
        grant_types: ['client_credentials'],
        access_token_strategy: 'opaque',
        owner: email,
        scope: 'offline',
      },
    });

    const { data: client } = await oryOidcService.getOidcDynamicClient({
      id: data.client_id as string,
    });
    expect(client).toBeDefined();

    return {
      clientId: data.client_id as string,
      clientSecret: data.client_secret as string,
    };
  };

  const exchangeToken = async (
    clientId: string,
    clientSecret: string
  ): Promise<TokenSet> => {
    const issuer = await Issuer.discover('http://localhost:4444');
    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
    });
    return client.grant({
      grant_type: 'client_credentials',
      scope: 'offline',
    });
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
        OryOidcModule.forRoot({
          basePath: 'http://localhost:44440',
        }),
        OryOAuth2Module.forRootAsync({
          useFactory: () => ({
            basePath: 'http://localhost:44450',
            accessToken: '',
          }),
        }),
      ],
      providers: [ExampleService],
      controllers: [ExampleController],
    }).compile();

    oryOAuth2Service = module.get(OryOAuth2Service);
    oryOidcService = module.get(OryOidcService);

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    return app?.close();
  });

  it('should successfully authenticate an Oauth2Client registered on Hydra', async () => {
    const email = `${randomBytes(8).toString('hex')}@example.com`;
    const { clientId, clientSecret } = await createOAuth2Client(email);
    const tokenSet = await exchangeToken(clientId, clientSecret);

    const { body } = await request(app.getHttpServer())
      .get(route)
      .set({
        Authorization: `Bearer ${tokenSet.access_token}`,
      });

    expect(body).toEqual({ message: clientId });
  });

  it('should fail to authenticate user when it is not registered in Ory Kratos', async () => {
    const { body } = await request(app.getHttpServer())
      .get(route)
      .set({
        Authorization: `Bearer ory_at_${randomBytes(8).toString('hex')}`,
      });
    expect(body).toEqual({
      message: 'Unauthorized',
      statusCode: 401,
    });
  });
});
