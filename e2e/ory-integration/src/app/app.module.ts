import { OryOAuth2Module } from '@getlarge/hydra-client-wrapper';
import { OryPermissionsModule } from '@getlarge/keto-client-wrapper';
import { OryFrontendModule } from '@getlarge/kratos-client-wrapper';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    OryPermissionsModule.forRoot({
      basePath: process.env['ORY_KETO_PUBLIC_URL'] ?? 'http://localhost:4466',
    }),
    OryOAuth2Module.forRoot({
      basePath: process.env['ORY_HYDRA_PUBLIC_URL'] ?? 'http://localhost:4444',
    }),
    OryFrontendModule.forRoot({
      basePath: process.env['ORY_KRATOS_PUBLIC_URL'] ?? 'http://localhost:4433',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
