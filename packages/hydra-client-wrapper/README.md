# hydra-client-wrapper

[![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/@getlarge/hydra-client-wrapper.svg?style=flat
[npm-url]: https://npmjs.org/package/@getlarge/hydra-client-wrapper

This library is a wrapper around the [Ory Hydra](https://www.ory.sh/hydra/docs/) client - [@ory/client](https://github.com/ory/client-js). It provides :

- `OryOidcModule`: a module to interact with the Ory Hydra Oidc (public) API
- `OryOAuth2Module`: a module to interact with the Ory Hydra OAuth2 (admin) API

## Install

```sh
npm install @getlarge/hydra-client-wrapper
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
import { OryOAuth2Service } from '@getlarge/hydra-client-wrapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YourService {
  constructor(private readonly oryOAuth2Service: OryOAuth2Service) {}

  async createClient(ownerId: string, scope = 'offline') {
    return this.oryOAuth2Service.createOAuth2Client({
      oAuth2Client: {
        grant_types: ['client_credentials'],
        access_token_strategy: 'opaque',
        owner: ownerId,
        scope,
      },
    });
  }
}
```

Use the Guard to protect your routes:

```ts
import { OryOAuth2AuthenticationGuard } from '@getlarge/hydra-client-wrapper';
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';

@Controller()
export class YourController {
  @UseGuards(
    OryOAuth2AuthenticationGuard({
      async postValidationHook(ctx, token) {
        const req = ctx.switchToHttp().getRequest();
        if (!token.client_id) {
          throw new Error('Client ID not found in token');
        }
        const { data: client } = await this.oryService.getOAuth2Client({
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
  async get() {
    return 'Hello World';
  }
}
```

## Development

### Building

Run `nx build hydra-client-wrapper` to build the library.

### Running unit tests

Run `nx test hydra-client-wrapper` to execute the unit tests via [Jest](https://jestjs.io).
