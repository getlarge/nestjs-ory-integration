import { OryBaseModuleOptions } from '@getlarge/base-client-wrapper';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface IOryPermissionsModuleOptions extends OryBaseModuleOptions {
  basePath: string;
  accessToken?: string;
  /**
   * Support batch permission check. Default is false.
   * Keep in mind that this feature is only supported in an unreleased version of Ory Keto.
   */
  supportBatchPermissionCheck?: boolean;
}

export class OryPermissionsModuleOptions
  extends OryBaseModuleOptions
  implements IOryPermissionsModuleOptions
{
  basePath: string;
  accessToken?: string;
  supportBatchPermissionCheck: boolean;
  constructor(options: IOryPermissionsModuleOptions) {
    super(options);
    this.basePath = options.basePath;
    this.accessToken = options.accessToken;
    this.supportBatchPermissionCheck =
      options.supportBatchPermissionCheck ?? false;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<IOryPermissionsModuleOptions> | IOryPermissionsModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
