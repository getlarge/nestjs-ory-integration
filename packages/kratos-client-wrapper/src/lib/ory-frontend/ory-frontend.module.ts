import { OryBaseModule } from '@getlarge/base-client-wrapper';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  IOryFrontendModuleOptions,
  OryFrontendModuleAsyncOptions,
  OryFrontendModuleOptions,
  OryFrontendModuleOptionsFactory,
} from './ory-frontend.interfaces';
import { OryFrontendService } from './ory-frontend.service';

@Module({})
export class OryFrontendModule {
  static forRoot(
    options: IOryFrontendModuleOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryFrontendModule,
      imports: [OryBaseModule.forRoot(options)],
      providers: [
        { provide: OryFrontendModuleOptions, useValue: options },
        OryFrontendService,
      ],
      exports: [OryFrontendModuleOptions, OryFrontendService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryFrontendModuleAsyncOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryFrontendModule,
      imports: options.imports
        ? [...options.imports, OryBaseModule.forRootAsync(options)]
        : [OryBaseModule.forRootAsync(options)],
      providers: [...this.createAsyncProviders(options), OryFrontendService],
      exports: [OryFrontendModuleOptions, OryFrontendService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryFrontendModuleAsyncOptions
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
    throw new Error('Invalid OryFrontendModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryFrontendModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryFrontendModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryFrontendModuleAsyncOptions');
    }
    return {
      provide: OryFrontendModuleOptions,
      useFactory: (optionsFactory: OryFrontendModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryFrontendModuleOptionsFactory>,
      ],
    };
  }
}
