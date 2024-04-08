import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface IOryOAuth2ModuleOptions extends OryBaseModuleOptions {
  basePath: string;
  accessToken: string;
}

export class OryOAuth2ModuleOptions
  extends OryBaseModuleOptions
  implements IOryOAuth2ModuleOptions
{
  basePath: string;
  accessToken: string;
  constructor(options: IOryOAuth2ModuleOptions) {
    super(options);
    this.basePath = options.basePath;
    this.accessToken = options.accessToken;
  }
}

export interface OryOAuth2ModuleOptionsFactory {
  createOptions(): Promise<IOryOAuth2ModuleOptions> | IOryOAuth2ModuleOptions;
}

export interface OryOAuth2ModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryOAuth2ModuleOptionsFactory>;
  useClass?: Type<OryOAuth2ModuleOptionsFactory>;
  useFactory?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<IOryOAuth2ModuleOptions> | IOryOAuth2ModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
