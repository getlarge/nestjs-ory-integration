# kratos-cli

[![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/@getlarge/keto-cli.svg?style=flat
[npm-url]: https://npmjs.org/package/@getlarge/keto-cli

This CLI interacts with the [Ory Kratos](https://www.ory.sh/kratos/docs/) self-service API.

## Install

```sh
npm install @getlarge/kratos-cli
```

## Usage

### To register a new identity

```sh
# base path is the Ory Kratos Public API URL - it can be passed via ORY_KRATOS_PUBLIC_URL environment variable
# the CLI will prompt for the password
npx @getlarge/kratos-cli register --email test@test.it \
--basePath http://localhost:4433
```

### To log in

```sh
# base path is the Ory Kratos Public API URL - it can be passed via ORY_KRATOS_PUBLIC_URL environment variable
# the CLI will prompt for the password
npx @getlarge/kratos-cli login --email test@test.it \
--basePath http://localhost:4433
```

## Development

### Building

Run `nx build kratos-cli` to build the library.

### Running unit tests

Run `nx test kratos-cli` to execute the unit tests via [Jest](https://jestjs.io).
