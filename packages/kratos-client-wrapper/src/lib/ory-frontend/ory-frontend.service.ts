import { OryBaseService } from '@getlarge/base-client-wrapper';
import { Inject, Injectable } from '@nestjs/common';
import { Configuration, FrontendApi } from '@ory/client';

import { OryFrontendModuleOptions } from './ory-frontend.interfaces';

@Injectable()
export class OryFrontendService extends FrontendApi {
  constructor(
    @Inject(OryFrontendModuleOptions)
    options: OryFrontendModuleOptions,
    @Inject(OryBaseService) baseService: OryBaseService
  ) {
    super(
      new Configuration({
        basePath: options.basePath,
      }),
      options.basePath,
      baseService.axios as ConstructorParameters<typeof FrontendApi>[2]
    );
  }
}
