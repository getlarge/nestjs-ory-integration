import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface IOryPermissionsModuleOptions extends OryBaseModuleOptions {
  basePath: string;
}

export class OryPermissionsModuleOptions
  extends OryBaseModuleOptions
  implements IOryPermissionsModuleOptions
{
  basePath: string;
  constructor(options: IOryPermissionsModuleOptions) {
    super(options);
    this.basePath = options.basePath;
  }
}

export interface OryPermissionsModuleOptionsFactory {
  createOptions():
    | Promise<IOryPermissionsModuleOptions>
    | IOryPermissionsModuleOptions;
}

export interface OryPermissionsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryPermissionsModuleOptionsFactory>;
  useClass?: Type<OryPermissionsModuleOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<IOryPermissionsModuleOptions> | IOryPermissionsModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
