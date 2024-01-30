import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Inject, Injectable } from '@nestjs/common';
import { Configuration, PermissionApi } from '@ory/client';

import { OryPermissionsModuleOptions } from './ory-permissions.interfaces';

@Injectable()
export class OryPermissionsService extends PermissionApi {
  constructor(
    @Inject(OryPermissionsModuleOptions)
    options: OryPermissionsModuleOptions,
    @Inject(OryBaseService) baseService: OryBaseService
  ) {
    super(
      new Configuration({
        basePath: options.basePath,
      }),
      options.basePath,
      baseService.axios as ConstructorParameters<typeof PermissionApi>[2]
    );
    this.configuration ??= new Configuration({
      basePath: options.basePath,
    });
  }

  get config(): Configuration {
    return this.configuration;
  }

  set config(config: Configuration) {
    this.configuration = config;
  }
}
