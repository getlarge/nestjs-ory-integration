import { OryBaseModule } from '@getlarge/base-client-wrapper';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  IOryIdentitiesModuleOptions,
  OryIdentitiesModuleAsyncOptions,
  OryIdentitiesModuleOptions,
  OryIdentitiesModuleOptionsFactory,
} from './ory-identities.interfaces';
import { OryIdentitiesService } from './ory-identities.service';

@Module({})
export class OryIdentitiesModule {
  static forRoot(
    options: IOryIdentitiesModuleOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryIdentitiesModule,
      imports: [OryBaseModule.forRoot(options)],
      providers: [
        { provide: OryIdentitiesModuleOptions, useValue: options },
        OryIdentitiesService,
      ],
      exports: [OryIdentitiesModuleOptions, OryIdentitiesService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryIdentitiesModuleAsyncOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryIdentitiesModule,
      imports: options.imports
        ? [...options.imports, OryBaseModule.forRootAsync(options)]
        : [OryBaseModule.forRootAsync(options)],
      providers: [...this.createAsyncProviders(options), OryIdentitiesService],
      exports: [OryIdentitiesModuleOptions, OryIdentitiesService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryIdentitiesModuleAsyncOptions
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
    throw new Error('Invalid OryIdentitiesModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryIdentitiesModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryIdentitiesModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryIdentitiesModuleAsyncOptions');
    }
    return {
      provide: OryIdentitiesModuleOptions,
      useFactory: (optionsFactory: OryIdentitiesModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryIdentitiesModuleOptionsFactory>,
      ],
    };
  }
}
