import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Configuration, IdentityApi } from '@ory/client';

import { OryIdentitiesModuleOptions } from './ory-identities.interfaces';

@Injectable()
export class OryIdentitiesService extends IdentityApi {
  readonly logger = new Logger(OryIdentitiesService.name);

  constructor(
    @Inject(OryIdentitiesModuleOptions)
    options: OryIdentitiesModuleOptions,
    @Inject(OryBaseService) baseService: OryBaseService
  ) {
    super(
      new Configuration({
        basePath: options.basePath,
        accessToken: options.accessToken,
      }),
      options.basePath,
      baseService.axios as ConstructorParameters<typeof IdentityApi>[2]
    );
    this.configuration ??= new Configuration({
      basePath: options.basePath,
      accessToken: options.accessToken,
    });
  }

  get config(): Configuration {
    return this.configuration as Configuration;
  }

  set config(config: Configuration) {
    this.configuration = config;
  }
}
