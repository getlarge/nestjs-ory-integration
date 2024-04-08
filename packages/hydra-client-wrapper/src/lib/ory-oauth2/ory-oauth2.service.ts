import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Configuration, OAuth2Api } from '@ory/client';

import { OryOAuth2ModuleOptions } from './ory-oauth2.interfaces';

@Injectable()
export class OryOAuth2Service extends OAuth2Api {
  readonly logger = new Logger(OryOAuth2Service.name);

  constructor(
    @Inject(OryOAuth2ModuleOptions)
    options: OryOAuth2ModuleOptions,
    @Inject(OryBaseService) baseService: OryBaseService
  ) {
    super(
      new Configuration({
        basePath: options.basePath,
        accessToken: options.accessToken,
      }),
      options.basePath,
      baseService.axios as ConstructorParameters<typeof OAuth2Api>[2]
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
