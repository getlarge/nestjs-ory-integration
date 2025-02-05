import { RelationTupleBuilder } from '@getlarge/keto-relations-parser';
import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { isAxiosError } from 'axios';
import { inspect } from 'node:util';

import { OryAuthorizationGuard } from '../src/lib/ory-authorization.guard';
import { OryPermissionChecks } from '../src/lib/ory-permission-checks.decorator';
import { ExampleService } from './app.service.mock';

const AuthorizationGuard = () =>
  OryAuthorizationGuard({
    postCheck(result) {
      console.warn('evalation results', result.results);
      console.warn('isPermitted', result.allowed);
    },
    unauthorizedFactory(ctx, error) {
      const axiosError =
        typeof error === 'object' &&
        error &&
        'error' in error &&
        isAxiosError(error.error)
          ? error.error
          : null;
      if (axiosError)
        console.error(inspect(axiosError.cause, false, null, true));
      return new ForbiddenException();
    },
  });

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
  @UseGuards(AuthorizationGuard())
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
  @UseGuards(AuthorizationGuard())
  @Get('complex/:id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getExampleComplex(@Param('id') id?: string) {
    return this.exampleService.getExample();
  }

  @OryPermissionChecks({
    type: 'OR',
    conditions: [
      {
        type: 'AND',
        conditions: [
          (ctx) => {
            const req = ctx.switchToHttp().getRequest();
            const currentUserId = req.headers['x-current-user-id'] as string;
            const resourceId = req.params.id;
            return new RelationTupleBuilder()
              .subject('User', currentUserId)
              .isAllowedTo('play')
              .of('Toy', resourceId)
              .toString();
          },
          (ctx) => {
            const req = ctx.switchToHttp().getRequest();
            const currentUserId = req.headers['x-current-user-id'] as string;
            const resourceId = req.params.id;
            return new RelationTupleBuilder()
              .subject('User', currentUserId)
              .isAllowedTo('break')
              .of('Toy', resourceId)
              .toString();
          },
        ],
      },
      (ctx) => {
        const req = ctx.switchToHttp().getRequest();
        const currentUserId = req.headers['x-current-user-id'] as string;
        return new RelationTupleBuilder()
          .subject('User', currentUserId)
          .isIn('members')
          .of('Group', 'admin')
          .toString();
      },
      (ctx) => {
        const req = ctx.switchToHttp().getRequest();
        const currentUserId = req.headers['x-current-user-id'] as string;
        return new RelationTupleBuilder()
          .subject('User', currentUserId)
          .isIn('members')
          .of('Group', 'superadmin')
          .toString();
      },
    ],
  })
  @UseGuards(AuthorizationGuard())
  @Get('complex2/:id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getExampleComplex2(@Param('id') id?: string) {
    return this.exampleService.getExample();
  }

  @OryPermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const currentUserId = req.headers['x-current-user-id'] as string;
    const resourceId = req.params.id;
    return new RelationTupleBuilder()
      .subject('User', currentUserId)
      .isAllowedTo('play')
      .of('Toy', resourceId)
      .toString();
  })
  @UseGuards(AuthorizationGuard())
  @Get('play/:id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  play(@Param('id') _id?: string) {
    return this.exampleService.getExample();
  }

  @OryPermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const resourceId = req.params.id;
    const currentUserId = req.headers['x-current-user-id'] as string;
    return {
      type: 'OR',
      conditions: [
        `Toy:${resourceId}#owners`,
        new RelationTupleBuilder()
          .subject('User', currentUserId)
          .isIn('owners')
          .of('Toy', resourceId)
          .toString(),
      ],
    };
  })
  @UseGuards(AuthorizationGuard())
  @Get('poly/:id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  poly(@Param('id') _id?: string) {
    return this.exampleService.getExample();
  }
}
