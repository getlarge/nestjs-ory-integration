import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Inject, Injectable } from '@nestjs/common';
import { Configuration, RelationshipApi } from '@ory/client';

import { OryRelationshipsModuleOptions } from './ory-relationships.interfaces';

@Injectable()
export class OryRelationshipsService extends RelationshipApi {
  constructor(
    @Inject(OryRelationshipsModuleOptions)
    options: OryRelationshipsModuleOptions,
    @Inject(OryBaseService) baseService: OryBaseService
  ) {
    super(
      new Configuration({
        basePath: options.basePath,
        accessToken: options.accessToken,
      }),
      options.basePath,
      baseService.axios as ConstructorParameters<typeof RelationshipApi>[2]
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
