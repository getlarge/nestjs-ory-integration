import {
  createPermissionCheckQuery,
  createRelationQuery,
  relationTupleBuilder,
} from '@getlarge/keto-relations-parser';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import request from 'supertest';

import { OryPermissionsService } from '../src/lib/ory-permissions';
import { OryPermissionsModule } from '../src/lib/ory-permissions/ory-permissions.module';
import { OryRelationshipsModule } from '../src/lib/ory-relationships/ory-relationships.module';
import { OryRelationshipsService } from '../src/lib/ory-relationships/ory-relationships.service';
import { ExampleController } from './app.controller.mock';
import { ExampleService } from './app.service.mock';

describe('Keto client wrapper E2E', () => {
  let app: INestApplication;
  let oryPermissionService: OryPermissionsService;
  let oryRelationshipsService: OryRelationshipsService;
  const dockerComposeFile = resolve(join(__dirname, 'docker-compose.yaml'));

  const route = '/Example';

  const createOryRelation = async (object: string, subjectObject: string) => {
    const relationTuple = relationTupleBuilder()
      .subject('User', subjectObject)
      .isIn('owners')
      .of('Toy', object)
      .toJSON();
    await oryRelationshipsService.createRelationship({
      createRelationshipBody:
        createRelationQuery(relationTuple).unwrapOrThrow(),
    });
    const { data } = await oryPermissionService.checkPermission(
      createPermissionCheckQuery(relationTuple).unwrapOrThrow()
    );
    expect(data.allowed).toEqual(true);
  };

  beforeAll(() => {
    execSync(`docker-compose -f ${dockerComposeFile} up -d --wait`, {
      stdio: 'ignore',
    });
  });

  afterAll(() => {
    execSync(`docker-compose -f ${dockerComposeFile} down`, {
      stdio: 'ignore',
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        OryPermissionsModule.forRoot({
          basePath: 'http://localhost:44660',
        }),
        OryRelationshipsModule.forRootAsync({
          useFactory: () => ({
            basePath: 'http://localhost:44670',
            accessToken: '',
          }),
        }),
      ],
      providers: [ExampleService],
      controllers: [ExampleController],
    }).compile();

    oryPermissionService = module.get<OryPermissionsService>(
      OryPermissionsService
    );
    oryRelationshipsService = module.get<OryRelationshipsService>(
      OryRelationshipsService
    );

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    return app?.close();
  });

  it('should pass authorization when relation exists in Ory Keto', async () => {
    const object = 'car';
    const subjectObject = 'Bob';
    await createOryRelation(object, subjectObject);

    const { body } = await request(app.getHttpServer())
      .get(`${route}/${object}`)
      .set({
        'x-current-user-id': subjectObject,
      });
    expect(body).toEqual({ message: 'OK' });
  });

  it('should fail authorization when relation does not exist in Ory Keto', async () => {
    const object = 'car';
    const subjectObject = 'Alice';

    const { body } = await request(app.getHttpServer())
      .get(`${route}/${object}`)
      .set({
        'x-current-user-id': subjectObject,
      });
    expect(body).toEqual({
      error: 'Forbidden',
      message: 'Forbidden resource',
      statusCode: 403,
    });
  });
});
