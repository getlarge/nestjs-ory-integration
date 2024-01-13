# keto-client-wrapper

This library is a wrapper around the [Ory Keto](https://www.ory.sh/keto/docs/) client - [@ory/client](https://github.com/ory/client-js). It provides :

- OryRelationshipsModule: a module to interact with the Ory Keto Relationships API
- OryPermissionsModule: a module to interact with the Ory Keto Permissions API
- OryAuthorizationGuard: a guard to protect your routes based on the Ory Keto permissions

## Install

```sh
npm install @getlarge/keto-client-wrapper
```

## Usage

Import the module in your app:

```ts
import {
  OryRelationshipsModule,
  OryPermissionsModule,
} from '@getlarge/keto-client-wrapper';
import { Module } from '@nestjs/common';

@Module({
   imports: [
    OryRelationshipsModule.forRoot({
      basePath: 'http://localhost:4467',
      accessToken: 'my-access-token',
    }),
    OryPermissionsModule.forRootAsync({
      useFactory: () => ({
        baseUrl: 'http://localhost:4466',
      }),
    }),
  ],
})

```

Inject the service in your provider:

```ts
import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YourService {
  constructor(private readonly oryRelationshipsService: OryRelationshipsService) {}
}

```

Use the Guard to protect your routes:

```ts
import { OryAuthorizationGuard, OryPermissionChecks } from '@getlarge/keto-client-wrapper';
import {
  RelationTupleBuilder,
} from '@getlarge/keto-relations-parser';
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';

@Controller()
export class YourController {

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
  @Get()
  getArticles() {
    return 'Articles';
  }
}
```

## Development

### Building

Run `nx build keto-client-wrapper` to build the library.

### Running unit tests

Run `nx test keto-client-wrapper` to execute the unit tests via [Jest](https://jestjs.io).
```
