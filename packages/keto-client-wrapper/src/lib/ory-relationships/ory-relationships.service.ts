import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Inject, Injectable } from '@nestjs/common';
import {
  Configuration,
  RelationshipApi,
  RelationshipApiGetRelationshipsRequest,
} from '@ory/client';
import { RawAxiosRequestConfig } from 'axios';

import { OryRelationshipsModuleOptions } from './ory-relationships.interfaces';

@Injectable()
export class OryRelationshipsService extends RelationshipApi {
  readonly publicBasePath?: string;

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

    this.publicBasePath = options.publicBasePath;
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

  // enable URL override for getRelationships, it should use the Public API URL when using self-hosted Ory Keto
  override getRelationships = (
    requestParameters?: RelationshipApiGetRelationshipsRequest,
    options: RawAxiosRequestConfig = {}
  ) =>
    super.getRelationships(requestParameters, {
      ...options,
      baseURL: this.publicBasePath ?? this.config.basePath,
    });
}
