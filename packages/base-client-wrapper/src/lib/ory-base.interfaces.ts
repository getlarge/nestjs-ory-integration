import type { AxiosError, AxiosRequestConfig } from 'axios';
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface AxiosExtraRequestConfig {
  retries?: number;
  retryCondition?: (error: AxiosError) => boolean;
  retryDelay?: (error: AxiosError, retryCount: number) => number;
}

export type OryAxiosRequestConfig = AxiosRequestConfig &
  AxiosExtraRequestConfig;

export interface IOryBaseModuleOptions {
  axiosConfig?: OryAxiosRequestConfig;
}

export class OryBaseModuleOptions implements IOryBaseModuleOptions {
  axiosConfig?: OryAxiosRequestConfig;

  constructor(options: IOryBaseModuleOptions) {
    this.axiosConfig = options.axiosConfig;
  }
}

export interface OryBaseModuleOptionsFactory {
  createOptions(): Promise<IOryBaseModuleOptions> | IOryBaseModuleOptions;
}

export interface OryBaseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryBaseModuleOptionsFactory>;
  useClass?: Type<OryBaseModuleOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<IOryBaseModuleOptions> | IOryBaseModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
