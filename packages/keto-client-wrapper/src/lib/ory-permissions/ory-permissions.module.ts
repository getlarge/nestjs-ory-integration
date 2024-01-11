import { OryBaseModule } from '@getlarge/base-client-wrapper';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  IOryPermissionsModuleOptions,
  OryPermissionsModuleAsyncOptions,
  OryPermissionsModuleOptions,
  OryPermissionsModuleOptionsFactory,
} from './ory-permissions.interfaces';
import { OryPermissionsService } from './ory-permissions.service';

@Module({})
export class OryPermissionsModule {
  static forRoot(
    options: IOryPermissionsModuleOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryPermissionsModule,
      imports: [OryBaseModule.forRoot(options)],
      providers: [
        { provide: OryPermissionsModuleOptions, useValue: options },
        OryPermissionsService,
      ],
      exports: [OryPermissionsModuleOptions, OryPermissionsService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryPermissionsModuleAsyncOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryPermissionsModule,
      imports: options.imports
        ? [...options.imports, OryBaseModule.forRootAsync(options)]
        : [OryBaseModule.forRootAsync(options)],
      providers: [...this.createAsyncProviders(options), OryPermissionsService],
      exports: [OryPermissionsModuleOptions, OryPermissionsService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryPermissionsModuleAsyncOptions
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
    throw new Error('Invalid OryPermissionsModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryPermissionsModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryPermissionsModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryPermissionsModuleAsyncOptions');
    }
    return {
      provide: OryPermissionsModuleOptions,
      useFactory: (optionsFactory: OryPermissionsModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryPermissionsModuleOptionsFactory>,
      ],
    };
  }
}
