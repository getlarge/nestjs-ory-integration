import {
  createPermissionCheckQuery,
  createRelationQuery,
  RelationTupleBuilder,
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

  const createOryRelation = async (relationTuple: RelationTupleBuilder) => {
    await oryRelationshipsService.createRelationship({
      createRelationshipBody: createRelationQuery(
        relationTuple.toJSON()
      ).unwrapOrThrow(),
    });
    const { data } = await oryPermissionService.checkPermission(
      createPermissionCheckQuery(relationTuple.toJSON()).unwrapOrThrow()
    );
    expect(data.allowed).toEqual(true);
  };

  const createOwnerRelation = async (object: string, subjectObject: string) => {
    const relationTuple = relationTupleBuilder()
      .subject('User', subjectObject)
      .isIn('owners')
      .of('Toy', object);
    await createOryRelation(relationTuple);
  };

  const createAdminRelation = async (subjectObject: string) => {
    const relationTuple = relationTupleBuilder()
      .subject('User', subjectObject)
      .isIn('members')
      .of('Group', 'admin');
    await createOryRelation(relationTuple);
  };

  const createPuppetmasterRelation = async (object: string) => {
    const relationTuple = relationTupleBuilder()
      .subject('Group', 'admin', 'members')
      .isIn('puppetmasters')
      .of('Toy', object);
    await createOryRelation(relationTuple);
  };

  beforeAll(() => {
    if (!process.env['CI']) {
      execSync(
        `docker compose -f ${dockerComposeFile} up -d --wait`,
        {
          stdio: 'ignore',
        }
      );
    }
  });

  afterAll(() => {
    if (!process.env['CI']) {
      execSync(`docker compose -f ${dockerComposeFile} down`, {
        stdio: 'ignore',
      });
    }
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
    await createOwnerRelation(object, subjectObject);

    const { body } = await request(app.getHttpServer())
      .get(`/Example/${object}`)
      .set({
        'x-current-user-id': subjectObject,
      });
    expect(body).toEqual({ message: 'OK' });
  });

  it('should fail authorization when relation does not exist in Ory Keto', async () => {
    const object = 'car';
    const subjectObject = 'Alice';

    const { body } = await request(app.getHttpServer())
      .get(`/Example/${object}`)
      .set({
        'x-current-user-id': subjectObject,
      });
    expect(body).toEqual({
      message: 'Forbidden',
      statusCode: 403,
    });
  });

  it('should pass authorization when relations exist in Ory Keto', async () => {
    const object = 'tractor';
    const subjectObject = 'Bob';
    await createOwnerRelation(object, subjectObject);
    await createAdminRelation(subjectObject);
    await createPuppetmasterRelation(object);

    const { body } = await request(app.getHttpServer())
      .get(`/Example/complex/${object}`)
      .set({
        'x-current-user-id': subjectObject,
      });
    expect(body).toEqual({ message: 'OK' });
  });
});
