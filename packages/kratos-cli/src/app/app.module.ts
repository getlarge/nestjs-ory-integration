import { OryFrontendModule } from '@getlarge/kratos-client-wrapper';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  OryKratosEnvironmentVariables,
  validate,
} from './environment-variables';
import { LoginCommand, LoginQuestions } from './login.command';
import {
  RegistrationCommand,
  RegistrationQuestions,
} from './registration.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
    }),
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<OryKratosEnvironmentVariables, true>
      ) => ({
        basePath: configService.get('ORY_KRATOS_PUBLIC_URL'),
      }),
    }),
  ],
  providers: [
    LoginCommand,
    LoginQuestions,
    RegistrationCommand,
    RegistrationQuestions,
  ],
})
export class AppModule {}
