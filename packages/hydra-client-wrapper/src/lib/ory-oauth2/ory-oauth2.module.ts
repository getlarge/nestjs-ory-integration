import { OryBaseModule } from '@getlarge/base-client-wrapper';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  IOryOAuth2ModuleOptions,
  OryOAuth2ModuleAsyncOptions,
  OryOAuth2ModuleOptions,
  OryOAuth2ModuleOptionsFactory,
} from './ory-oauth2.interfaces';
import { OryOAuth2Service } from './ory-oauth2.service';

@Module({})
export class OryOAuth2Module {
  static forRoot(
    options: IOryOAuth2ModuleOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryOAuth2Module,
      imports: [OryBaseModule.forRoot(options)],
      providers: [
        { provide: OryOAuth2ModuleOptions, useValue: options },
        OryOAuth2Service,
      ],
      exports: [OryOAuth2ModuleOptions, OryOAuth2Service],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryOAuth2ModuleAsyncOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryOAuth2Module,
      imports: options.imports
        ? [...options.imports, OryBaseModule.forRootAsync(options)]
        : [OryBaseModule.forRootAsync(options)],
      providers: [...this.createAsyncProviders(options), OryOAuth2Service],
      exports: [OryOAuth2ModuleOptions, OryOAuth2Service],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryOAuth2ModuleAsyncOptions
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
    throw new Error('Invalid OryOAuth2ModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryOAuth2ModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryOAuth2ModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryOAuth2ModuleAsyncOptions');
    }
    return {
      provide: OryOAuth2ModuleOptions,
      useFactory: (optionsFactory: OryOAuth2ModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryOAuth2ModuleOptionsFactory>,
      ],
    };
  }
}
