import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Injectable } from '@nestjs/common';
import { Configuration, JwkApi } from '@ory/client';

import { OryJwkModuleOptions } from './ory-jwk.interfaces';

@Injectable()
export class OryJwkService extends JwkApi {
  constructor(options: OryJwkModuleOptions, baseService: OryBaseService) {
    super(
      new Configuration({
        basePath: options.basePath,
        accessToken: options.accessToken,
      }),
      options.basePath,
      baseService.axios as ConstructorParameters<typeof JwkApi>[2],
    );
    this.configuration ??= new Configuration({
      basePath: options.basePath,
      accessToken: options.accessToken,
    });
  }

  get config() {
    return this.configuration;
  }

  set config(config) {
    this.configuration = config;
  }
}
