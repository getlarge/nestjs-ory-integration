import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from '@getlarge/keto-client-wrapper';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CheckPermissionCommand } from './check-permission.command';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        basePath: configService.get(
          'ORY_KETO_PUBLIC_URL',
          'http://localhost:4466'
        ),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accessToken: configService.get('ORY_KETO_API_KEY', ''),
        basePath: configService.get('ORY_KETO_ADMIN_URL', ''),
      }),
    }),
  ],
  providers: [CheckPermissionCommand],
})
export class AppModule {}
