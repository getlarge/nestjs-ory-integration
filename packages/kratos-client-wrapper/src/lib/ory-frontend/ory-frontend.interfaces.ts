import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface IOryFrontendModuleOptions extends OryBaseModuleOptions {
  basePath: string;
}

export class OryFrontendModuleOptions
  extends OryBaseModuleOptions
  implements IOryFrontendModuleOptions
{
  basePath: string;
  constructor(options: IOryFrontendModuleOptions) {
    super(options);
    this.basePath = options.basePath;
  }
}

export interface OryFrontendModuleOptionsFactory {
  createOptions():
    | Promise<IOryFrontendModuleOptions>
    | IOryFrontendModuleOptions;
}

export interface OryFrontendModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryFrontendModuleOptionsFactory>;
  useClass?: Type<OryFrontendModuleOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<IOryFrontendModuleOptions> | IOryFrontendModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
