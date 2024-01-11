import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';
import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';

export interface IOryIdentitiesModuleOptions extends OryBaseModuleOptions {
  basePath: string;
  accessToken: string;
}

export class OryIdentitiesModuleOptions
  extends OryBaseModuleOptions
  implements IOryIdentitiesModuleOptions
{
  basePath: string;
  accessToken: string;
  constructor(options: IOryIdentitiesModuleOptions) {
    super(options);
    this.basePath = options.basePath;
    this.accessToken = options.accessToken;
  }
}

export interface OryIdentitiesModuleOptionsFactory {
  createOptions():
    | Promise<IOryIdentitiesModuleOptions>
    | IOryIdentitiesModuleOptions;
}

export interface OryIdentitiesModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryIdentitiesModuleOptionsFactory>;
  useClass?: Type<OryIdentitiesModuleOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<IOryIdentitiesModuleOptions> | IOryIdentitiesModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
