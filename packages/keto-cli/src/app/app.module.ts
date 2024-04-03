import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from '@getlarge/keto-client-wrapper';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CheckPermissionCommand } from './check-permission.command';
import { CreateRelationCommand } from './create-relation.command';
import { DeleteRelationCommand } from './delete-relation.command';
import { OryKetoEnvironmentVariables, validate } from './environment-variables';
import { ExpandPermissionsCommand } from './expand-permissions.command';
import { GetRelationsCommand } from './get-relations.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<OryKetoEnvironmentVariables, true>
      ) => ({
        basePath: configService.get('ORY_KETO_PUBLIC_URL'),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<OryKetoEnvironmentVariables, true>
      ) => ({
        accessToken: configService.get('ORY_KETO_API_KEY'),
        basePath: configService.get('ORY_KETO_ADMIN_URL'),
      }),
    }),
  ],
  providers: [
    CheckPermissionCommand,
    CreateRelationCommand,
    DeleteRelationCommand,
    ExpandPermissionsCommand,
    GetRelationsCommand,
  ],
})
export class AppModule {}
