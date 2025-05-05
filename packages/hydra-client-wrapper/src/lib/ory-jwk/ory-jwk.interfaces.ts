import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface IOryJwkModuleOptions extends OryBaseModuleOptions {
  basePath: string;
  accessToken?: string;
}

export class OryJwkModuleOptions
  extends OryBaseModuleOptions
  implements IOryJwkModuleOptions
{
  basePath: string;
  accessToken?: string;
  constructor(options: IOryJwkModuleOptions) {
    super(options);
    this.basePath = options.basePath;
    this.accessToken = options.accessToken;
  }
}

export interface OryJwkModuleOptionsFactory {
  createOptions(): Promise<IOryJwkModuleOptions> | IOryJwkModuleOptions;
}

export interface OryJwkModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryJwkModuleOptionsFactory>;
  useClass?: Type<OryJwkModuleOptionsFactory>;
  useFactory?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<IOryJwkModuleOptions> | IOryJwkModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
