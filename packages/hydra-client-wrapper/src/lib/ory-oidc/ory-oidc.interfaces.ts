import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface IOryOidcModuleOptions extends OryBaseModuleOptions {
  basePath: string;
}

export class OryOidcModuleOptions
  extends OryBaseModuleOptions
  implements IOryOidcModuleOptions
{
  basePath: string;
  constructor(options: IOryOidcModuleOptions) {
    super(options);
    this.basePath = options.basePath;
  }
}

export interface OryOidcModuleOptionsFactory {
  createOptions(): Promise<IOryOidcModuleOptions> | IOryOidcModuleOptions;
}

export interface OryOidcModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryOidcModuleOptionsFactory>;
  useClass?: Type<OryOidcModuleOptionsFactory>;
  useFactory?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<IOryOidcModuleOptions> | IOryOidcModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
