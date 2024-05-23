import { HttpModule, type HttpModuleOptions, HttpService } from '@nestjs/axios';
import {
  type DynamicModule,
  Module,
  type Provider,
  type Type,
} from '@nestjs/common';
import axios from 'axios';

import {
  type AxiosExtraRequestConfig,
  type IOryBaseModuleOptions,
  type OryBaseModuleAsyncOptions,
  OryBaseModuleOptions,
  type OryBaseModuleOptionsFactory,
} from './ory-base.interfaces';
import { OryBaseService } from './ory-base.service';

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AxiosRequestConfig extends AxiosExtraRequestConfig {}
}

const httpModuleOptionsFactory = (
  options: IOryBaseModuleOptions
): HttpModuleOptions => ({
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
});

@Module({})
export class OryBaseModule {
  static forRoot(
    options: IOryBaseModuleOptions,
    isGlobal?: boolean
  ): DynamicModule {
    const providers = [
      { provide: OryBaseModuleOptions, useValue: options },
      OryBaseService,
    ];

    return {
      module: OryBaseModule,
      imports: [HttpModule.register(httpModuleOptionsFactory(options))],
      providers,
      exports: [OryBaseService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryBaseModuleAsyncOptions,
    isGlobal?: boolean
  ): DynamicModule {
    const providers: Provider[] = [
      ...this.createAsyncProviders(options),
      OryBaseService,
      {
        provide: HttpService,
        useFactory: (options: OryBaseModuleOptions) => {
          const axiosInstance = axios.create(httpModuleOptionsFactory(options));
          return new HttpService(axiosInstance);
        },
        inject: [OryBaseModuleOptions],
      },
    ];

    return {
      module: OryBaseModule,
      imports: options.imports ?? [],
      providers,
      exports: [OryBaseService],
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
