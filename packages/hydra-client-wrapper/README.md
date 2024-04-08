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

## Development

### Building

Run `nx build hydra-client-wrapper` to build the library.

### Running unit tests

Run `nx test hydra-client-wrapper` to execute the unit tests via [Jest](https://jestjs.io).
