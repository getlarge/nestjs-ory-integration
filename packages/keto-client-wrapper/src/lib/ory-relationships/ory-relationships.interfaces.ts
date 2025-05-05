import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface IOryRelationshipsModuleOptions extends OryBaseModuleOptions {
  basePath: string;
  publicBasePath?: string;
  accessToken?: string;
}

export class OryRelationshipsModuleOptions
  extends OryBaseModuleOptions
  implements IOryRelationshipsModuleOptions
{
  basePath: string;
  publicBasePath?: string;
  accessToken?: string;
  constructor(options: IOryRelationshipsModuleOptions) {
    super(options);
    this.basePath = options.basePath;
    this.publicBasePath = options.publicBasePath;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<IOryRelationshipsModuleOptions> | IOryRelationshipsModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
