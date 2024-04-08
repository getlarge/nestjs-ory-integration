import { OryBaseModule } from '@getlarge/base-client-wrapper';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  IOryOidcModuleOptions,
  OryOidcModuleAsyncOptions,
  OryOidcModuleOptions,
  OryOidcModuleOptionsFactory,
} from './ory-oidc.interfaces';
import { OryOidcService } from './ory-oidc.service';

@Module({})
export class OryOidcModule {
  static forRoot(
    options: IOryOidcModuleOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryOidcModule,
      imports: [OryBaseModule.forRoot(options)],
      providers: [
        { provide: OryOidcModuleOptions, useValue: options },
        OryOidcService,
      ],
      exports: [OryOidcModuleOptions, OryOidcService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryOidcModuleAsyncOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryOidcModule,
      imports: options.imports
        ? [...options.imports, OryBaseModule.forRootAsync(options)]
        : [OryBaseModule.forRootAsync(options)],
      providers: [...this.createAsyncProviders(options), OryOidcService],
      exports: [OryOidcModuleOptions, OryOidcService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryOidcModuleAsyncOptions
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
    throw new Error('Invalid OryOidcModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryOidcModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryOidcModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryOidcModuleAsyncOptions');
    }
    return {
      provide: OryOidcModuleOptions,
      useFactory: (optionsFactory: OryOidcModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryOidcModuleOptionsFactory>,
      ],
    };
  }
}
