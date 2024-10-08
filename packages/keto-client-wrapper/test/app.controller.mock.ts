import { RelationTupleBuilder } from '@getlarge/keto-relations-parser';
import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';

import { OryAuthorizationGuard } from '../src/lib/ory-authorization.guard';
import { OryPermissionChecks } from '../src/lib/ory-permission-checks.decorator';
import { ExampleService } from './app.service.mock';

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
      postCheck(result) {
        Logger.log('relationTuple', Object.keys(result.results)[0]);
        Logger.log('isPermitted', result.allowed);
      },
    })
  )
  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getExample(@Param('id') id?: string) {
    return this.exampleService.getExample();
  }

  @OryPermissionChecks({
    type: 'AND',
    conditions: [
      (ctx) => {
        const req = ctx.switchToHttp().getRequest();
        const currentUserId = req.headers['x-current-user-id'] as string;
        const resourceId = req.params.id;
        return new RelationTupleBuilder()
          .subject('User', currentUserId)
          .isIn('owners')
          .of('Toy', resourceId)
          .toString();
      },
      {
        type: 'OR',
        conditions: [
          (ctx) => {
            const req = ctx.switchToHttp().getRequest();
            const currentUserId = req.headers['x-current-user-id'] as string;
            const resourceId = req.params.id;
            return new RelationTupleBuilder()
              .subject('User', currentUserId)
              .isIn('puppetmasters')
              .of('Toy', resourceId)
              .toString();
          },
          (ctx) => {
            const req = ctx.switchToHttp().getRequest();
            const currentUserId = req.headers['x-current-user-id'] as string;
            const resourceId = req.params.id;
            return new RelationTupleBuilder()
              .subject('User', currentUserId)
              .isAllowedTo('steal')
              .of('Toy', resourceId)
              .toString();
          },
        ],
      },
    ],
  })
  @UseGuards(
    OryAuthorizationGuard({
      postCheck(result) {
        Logger.log('relationTuples', Object.keys(result.results));
        Logger.log('isPermitted', result.allowed);
      },
    })
  )
  @Get('complex/:id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getExampleComplex(@Param('id') id?: string) {
    return this.exampleService.getExample();
  }
}
