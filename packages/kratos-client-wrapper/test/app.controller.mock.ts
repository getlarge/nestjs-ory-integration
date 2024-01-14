import { Controller, Get, UseGuards } from '@nestjs/common';

import { OryAuthenticationGuard } from '../src/lib/ory-authentication.guard';
import { ExampleService } from './app.service.mock';

@Controller('Example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @UseGuards(
    OryAuthenticationGuard({
      postValidationHook: (ctx, session) => {
        const req = ctx.switchToHttp().getRequest();
        req.session = session;
        req.user = session.identity;
      },
      isValidSession(session): boolean {
        return !!session.active;
      },
      sessionTokenResolver: (ctx) =>
        ctx
          .switchToHttp()
          .getRequest()
          ?.headers?.authorization?.replace('Bearer ', ''),
    })
  )
  @Get()
  getExample() {
    return this.exampleService.getExample();
  }
}
