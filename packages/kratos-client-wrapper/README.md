# kratos-client-wrapper

[![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/@getlarge/kratos-client-wrapper.svg?style=flat
[npm-url]: https://npmjs.org/package/@getlarge/kratos-client-wrapper

This library is a wrapper around the [Ory Kratos](https://www.ory.sh/kratos/docs/) client - [@ory/client](https://github.com/ory/client-js). It provides :

- `OryIdentitiesModule`: a module to interact with the Ory Kratos Identities API
- `OryFrontendModule`: a module to interact with the Ory Kratos Frontend API
- `OryAuthenticationGuard`: a guard to protect your routes based on the Ory Kratos session

## Install

```sh
npm install @getlarge/kratos-client-wrapper
```

## Usage

Import the module in your app:

```ts
import {
  OryIdentitiesModule,
  OryFrontendModule,
} from '@getlarge/kratos-client-wrapper';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    OryIdentitiesModule.forRoot({
      basePath: 'http://localhost:4434',
      accessToken: 'my-access-token',
    }),
    OryFrontendModule.forRootAsync({
      useFactory: () => ({
        baseUrl: 'http://localhost:4433',
      }),
    }),
  ],
})
export class YourModule {}
```

Inject the service in your provider:

```ts
import { OryIdentitiesService } from '@getlarge/kratos-client-wrapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YourService {
  constructor(private readonly oryIdentitiesService: OryIdentitiesService) {}
}
```

Use the Guard to protect your routes:

```ts
import { OryAuthenticationGuard } from '@getlarge/kratos-client-wrapper';
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';

@Controller()
export class YourController {
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
  async get() {
    return 'Hello World';
  }
}
```

## Development

### Building

Run `nx build kratos-client-wrapper` to build the library.

### Running unit tests

Run `nx test kratos-client-wrapper` to execute the unit tests via [Jest](https://jestjs.io).
