import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { OryOAuth2AuthenticationGuard } from '../src/lib/ory-oauth2-authentication.guard';
import { ExampleService } from './app.service.mock';

@Controller('Example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @UseGuards(
    OryOAuth2AuthenticationGuard({
      async postValidationHook(ctx, token) {
        const req = ctx.switchToHttp().getRequest();
        if (!token.client_id) {
          throw new Error('Client ID not found in token');
        }
        const client = await this.oryService.getOAuth2Client({
          id: token.client_id,
        });
        req.client = client;
      },
      accessTokenResolver: (ctx) =>
        ctx
          .switchToHttp()
          .getRequest()
          ?.headers?.authorization?.replace('Bearer ', ''),
    })
  )
  @Get()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExample(@Req() req: any) {
    return this.exampleService.getExample(req.client);
  }
}
