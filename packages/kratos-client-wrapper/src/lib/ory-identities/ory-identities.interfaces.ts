import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<IOryIdentitiesModuleOptions> | IOryIdentitiesModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
