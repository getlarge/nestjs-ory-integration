import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import {
  AxiosExtraRequestConfig,
  IOryBaseModuleOptions,
  OryBaseModuleAsyncOptions,
  OryBaseModuleOptions,
  OryBaseModuleOptionsFactory,
} from './ory-base.interfaces';
import { OryBaseService } from './ory-base.service';

declare module 'axios' {
  interface AxiosRequestConfig extends AxiosExtraRequestConfig {}
}

const HttpModuleWithRetry = HttpModule.registerAsync({
  inject: [OryBaseModuleOptions],
  useFactory: (options: IOryBaseModuleOptions) => ({
    timeout: 5000,
    responseType: 'json',
    validateStatus(status: number) {
      return status >= 200 && status < 300;
    },
    retries: 3,
    retryCondition(error) {
      const statusToRetry = [429];
      return error.response?.status
        ? statusToRetry.includes(error.response?.status)
        : false;
    },
    retryDelay(error, retryCount) {
      if (error.response?.status === 429) {
        const headers = error.response.headers;
        const remaining = headers['x-ratelimit-remaining'];
        const resetTimestamp = headers['x-ratelimit-reset'];
        if (Number(remaining) === 0) {
          return Number(resetTimestamp) * 1000 - Date.now();
        }
      }
      return retryCount * 250;
    },
    ...options.axiosConfig,
  }),
});

@Module({})
export class OryBaseModule {
  static forRoot(
    options: IOryBaseModuleOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryBaseModule,
      imports: [HttpModuleWithRetry],
      providers: [
        { provide: OryBaseModuleOptions, useValue: options },
        OryBaseService,
      ],
      exports: [OryBaseModuleOptions, OryBaseService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryBaseModuleAsyncOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryBaseModule,
      imports: options.imports
        ? [...options.imports, HttpModuleWithRetry]
        : [HttpModuleWithRetry],
      providers: [...this.createAsyncProviders(options), OryBaseService],
      exports: [OryBaseModuleOptions, OryBaseService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryBaseModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    if (options.useClass) {
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }
    throw new Error('Invalid OryBaseModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryBaseModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryBaseModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryBaseModuleAsyncOptions');
    }
    return {
      provide: OryBaseModuleOptions,
      useFactory: (optionsFactory: OryBaseModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryBaseModuleOptionsFactory>,
      ],
    };
  }
}
