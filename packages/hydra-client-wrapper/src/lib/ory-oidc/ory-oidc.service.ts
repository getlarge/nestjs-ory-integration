import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Inject, Injectable } from '@nestjs/common';
import { Configuration, OidcApi } from '@ory/client';

import { OryOidcModuleOptions } from './ory-oidc.interfaces';

@Injectable()
export class OryOidcService extends OidcApi {
  constructor(
    @Inject(OryOidcModuleOptions)
    options: OryOidcModuleOptions,
    @Inject(OryBaseService) baseService: OryBaseService
  ) {
    super(
      new Configuration({
        basePath: options.basePath,
      }),
      options.basePath,
      baseService.axios as ConstructorParameters<typeof OidcApi>[2]
    );
    this.configuration ??= new Configuration({
      basePath: options.basePath,
    });
  }

  get config(): Configuration {
    return this.configuration as Configuration;
  }

  set config(config: Configuration) {
    this.configuration = config;
  }
}
