import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Inject, Injectable } from '@nestjs/common';
import { Configuration, PermissionApi } from '@ory/client';

import { OryPermissionsModuleOptions } from './ory-permissions.interfaces';

@Injectable()
export class OryPermissionsService extends PermissionApi {
  readonly supportBatchPermissionCheck: boolean;

  constructor(
    @Inject(OryPermissionsModuleOptions)
    options: OryPermissionsModuleOptions,
    @Inject(OryBaseService) baseService: OryBaseService
  ) {
    super(
      new Configuration({
        basePath: options.basePath,
        accessToken: options.accessToken,
      }),
      options.basePath,
      baseService.axios as ConstructorParameters<typeof PermissionApi>[2]
    );
    this.configuration ??= new Configuration({
      basePath: options.basePath,
    });
    this.supportBatchPermissionCheck = options.supportBatchPermissionCheck;
  }

  get config(): Configuration {
    return this.configuration as Configuration;
  }

  set config(config: Configuration) {
    this.configuration = config;
  }
}
