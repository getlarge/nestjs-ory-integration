import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { RelationTupleBuilder } from '@getlarge/keto-relations-parser';

import { ExampleService } from './app.service.mock';
import { OryAuthorizationGuard } from '../src/lib/ory-authorization.guard';
import { OryPermissionChecks } from '../src/lib/ory-permission-checks.decorator';

@Controller('Example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @OryPermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const currentUserId = req.headers['x-current-user-id'] as string;
    const resourceId = req.params.id;
    return new RelationTupleBuilder()
      .subject('User', currentUserId)
      .isIn('owners')
      .of('Toy', resourceId)
      .toString();
  })
  @UseGuards(
    OryAuthorizationGuard({
      postCheck(relationTuple, isPermitted) {
        Logger.log('relationTuple', relationTuple);
        Logger.log('isPermitted', isPermitted);
      },
    })
  )
  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getExample(@Param('id') id?: string) {
    return this.exampleService.getExample();
  }
}
