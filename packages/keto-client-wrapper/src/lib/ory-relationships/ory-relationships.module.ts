import { OryBaseModule } from '@getlarge/base-client-wrapper';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  IOryRelationshipsModuleOptions,
  OryRelationshipsModuleAsyncOptions,
  OryRelationshipsModuleOptions,
  OryRelationshipsModuleOptionsFactory,
} from './ory-relationships.interfaces';
import { OryRelationshipsService } from './ory-relationships.service';

@Module({})
export class OryRelationshipsModule {
  static forRoot(
    options: IOryRelationshipsModuleOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryRelationshipsModule,
      imports: [OryBaseModule.forRoot(options)],
      providers: [
        { provide: OryRelationshipsModuleOptions, useValue: options },
        OryRelationshipsService,
      ],
      exports: [OryRelationshipsModuleOptions, OryRelationshipsService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryRelationshipsModuleAsyncOptions,
    isGlobal?: boolean
  ): DynamicModule {
    return {
      module: OryRelationshipsModule,
      imports: options.imports
        ? [...options.imports, OryBaseModule.forRootAsync(options)]
        : [OryBaseModule.forRootAsync(options)],
      providers: [
        ...this.createAsyncProviders(options),
        OryRelationshipsService,
      ],
      exports: [OryRelationshipsModuleOptions, OryRelationshipsService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryRelationshipsModuleAsyncOptions
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
    throw new Error('Invalid OryRelationshipsModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryRelationshipsModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryRelationshipsModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryRelationshipsModuleAsyncOptions');
    }
    return {
      provide: OryRelationshipsModuleOptions,
      useFactory: (optionsFactory: OryRelationshipsModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryRelationshipsModuleOptionsFactory>,
      ],
    };
  }
}
