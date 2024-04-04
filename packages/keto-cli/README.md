# keto-cli

[![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/@getlarge/keto-cli.svg?style=flat
[npm-url]: https://npmjs.org/package/@getlarge/keto-cli

This CLI interacts with the [Ory Keto](https://www.ory.sh/keto/docs/) API.

## Install

```sh
npm install @getlarge/keto-cli
```

## Usage

### To check if a permission is granted

```sh
# base path is the Ory Keto Public API URL - it can be passed via ORY_KETO_PUBLIC_URL environment variable
npx @getlarge/keto-cli check --tuple Group:admin#members@User:1 \
--basePath http://localhost:4466
```

### To create a relationship

```sh
# base path is the Ory Keto Admin API URL - it can be passed via ORY_KETO_PUBLIC_URL environment variable
# access token is the Ory Keto Admin API access token - it should be passed via ORY_KETO_API_KEY environment variable
npx @getlarge/keto-cli create --tuple Group:admin#members@User:1 \
--basePath http://localhost:4467 --accessToken my-access-token
```

### To delete a relationship

```sh
# base path is the Ory Keto Admin API URL - it can be passed via ORY_KETO_PUBLIC_URL environment variable
# access token is the Ory Keto Admin API access token - it should be passed via ORY_KETO_API_KEY environment variable
npx @getlarge/keto-cli delete --tuple Group:admin#members@User:1 \
--basePath http://localhost:4467 --accessToken my-access-token
```

### To expand a relation tuple

```sh
npx @getlarge/keto-cli expand --tuple Group:admin#members --depth 2 \
--basePath http://localhost:4466
```

### To list all relationships

```sh
# base path is the Ory Keto Admin API URL - it can be passed via ORY_KETO_PUBLIC_URL environment variable
# access token is the Ory Keto Admin API access token - it should be passed via ORY_KETO_API_KEY environment variable
npx @getlarge/keto-cli get --namespace Group --object admin \
--basePath http://localhost:4467 --accessToken my-access-token
```

## Development

### Building

Run `nx build keto-cli` to build the library.

### Running unit tests

Run `nx test keto-cli` to execute the unit tests via [Jest](https://jestjs.io).
