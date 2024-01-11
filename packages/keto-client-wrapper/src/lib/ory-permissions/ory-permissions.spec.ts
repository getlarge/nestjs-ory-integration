import { Test, TestingModule } from '@nestjs/testing';
import { OryPermissionsService } from './ory-permissions.service';
import { OryBaseService } from '@getlarge/base-client-wrapper';
import { OryPermissionsModuleOptions } from './ory-permissions.interfaces';

describe('OryPermissionsService', () => {
  let oryPermissionsService: OryPermissionsService;
  let oryBaseService: OryBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryPermissionsService,
        {
          provide: OryPermissionsModuleOptions,
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

    oryPermissionsService = module.get<OryPermissionsService>(
      OryPermissionsService
    );
    oryBaseService = module.get<OryBaseService>(OryBaseService);
  });

  it('should be defined', () => {
    expect(OryPermissionsService).toBeDefined();
  });

  describe('Should use custom axios instance', () => {
    it('should call checkPermission endpoint', async () => {
      const result = { data: 'test' };
      const permissionQuery = {
        namespace: 'namespace',
        object: 'object',
        relation: 'relation',
      };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      await oryPermissionsService.checkPermission(permissionQuery);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost/relation-tuples/check/openapi?namespace=${permissionQuery.namespace}&object=${permissionQuery.object}&relation=${permissionQuery.relation}`,
        method: 'GET',
        headers: {},
      });
    });

    it('should call postCheckPermissionOrError endpoint', async () => {
      const result = { data: 'test' };
      oryBaseService.axios.request = jest.fn().mockResolvedValue(result);

      const payload = {
        postCheckPermissionOrErrorBody: {
          namespace: 'namespace',
          object: 'object',
          relation: 'relation',
        },
      };
      await oryPermissionsService.postCheckPermissionOrError(payload);
      expect(oryBaseService.axios.request).toHaveBeenCalledWith({
        url: `http://localhost/relation-tuples/check`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(payload.postCheckPermissionOrErrorBody),
      });
    });
  });
});
