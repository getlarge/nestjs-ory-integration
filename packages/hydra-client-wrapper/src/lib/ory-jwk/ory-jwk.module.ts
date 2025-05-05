import { OryBaseModule } from '@getlarge/base-client-wrapper';
import { DynamicModule, Provider, Type } from '@nestjs/common';

import {
  IOryJwkModuleOptions,
  OryJwkModuleAsyncOptions,
  OryJwkModuleOptions,
  OryJwkModuleOptionsFactory,
} from './ory-jwk.interfaces';
import { OryJwkService } from './ory-jwk.service';

export class OryJwkModule {
  static forRoot(
    options: IOryJwkModuleOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: OryJwkModule,
      imports: [OryBaseModule.forRoot(options)],
      providers: [
        { provide: OryJwkModuleOptions, useValue: options },
        OryJwkService,
      ],
      exports: [OryJwkModuleOptions, OryJwkService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryJwkModuleAsyncOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: OryJwkModule,
      imports: options.imports
        ? [...options.imports, OryBaseModule.forRootAsync(options)]
        : [OryBaseModule.forRootAsync(options)],
      providers: [...this.createAsyncProviders(options), OryJwkService],
      exports: [OryJwkModuleOptions, OryJwkService],
      global: isGlobal,
    };
  }

  static createAsyncProviders(options: OryJwkModuleAsyncOptions) {
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
    throw new Error('Invalid OryJwkModuleAsyncOptions');
  }

  static createAsyncOptionsProvider(
    options: OryJwkModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryJwkModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryJwkModuleAsyncOptions');
    }
    return {
      provide: OryJwkModuleOptions,
      useFactory: (optionsFactory: OryJwkModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryJwkModuleOptionsFactory>,
      ],
    };
  }
}
