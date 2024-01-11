import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';
import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';

export interface IOryRelationshipsModuleOptions extends OryBaseModuleOptions {
  basePath: string;
  accessToken: string;
}

export class OryRelationshipsModuleOptions
  extends OryBaseModuleOptions
  implements IOryRelationshipsModuleOptions
{
  basePath: string;
  accessToken: string;
  constructor(options: IOryRelationshipsModuleOptions) {
    super(options);
    this.basePath = options.basePath;
    this.accessToken = options.accessToken;
  }
}

export interface OryRelationshipsModuleOptionsFactory {
  createOptions():
    | Promise<IOryRelationshipsModuleOptions>
    | IOryRelationshipsModuleOptions;
}

export interface OryRelationshipsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryRelationshipsModuleOptionsFactory>;
  useClass?: Type<OryRelationshipsModuleOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<IOryRelationshipsModuleOptions> | IOryRelationshipsModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
