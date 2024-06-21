<p align="center">
  <a href="https://github.com/getlarge/nestjs-ory-integration/" target="blank"><img src="https://ipfs.io/ipfs/QmQ6CMaraTMrv8byJfY64mDM6o7citx1pgEobMKWEJaSCB?filename=ory-nestjs-min.png" width="120" alt="NestOry Logo" /></a>
</p>

# NestJS Ory Integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/getlarge/nestjs-ory-integration/actions/workflows/ci.yaml/badge.svg?branch=main&event=push)](https://github.com/getlarge/nestjs-ory-integration/actions/workflows/ci.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=getlarge_nestjs-ory-integration&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=getlarge_nestjs-ory-integration)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

🍃This suite of libraries will make the integration or Ory Kratos, Keto and Hydra a breeze in your next NestJS projects!

📦This is a mono repository containing the following packages:

| Package                                                             | Description                                                                                                            | Version                                                                                                                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [keto-client-wrapper](./packages/keto-client-wrapper/README.md)     | A NestJS library to integrate [Ory Keto](https://www.ory.sh/keto/docs/) API                                            | [![npm](https://img.shields.io/npm/v/@getlarge/keto-client-wrapper.svg?style=flat)](https://npmjs.org/package/@getlarge/keto-client-wrapper)     |
| [keto-relations-parser](./packages/keto-relations-parser/README.md) | A TS library to parse a string representation of a Relation tuple using [Zanzibar](https://zanzibar.academy) notation. | [![npm](https://img.shields.io/npm/v/@getlarge/keto-relations-parser.svg?style=flat)](https://npmjs.org/package/@getlarge/keto-relations-parser) |
| [kratos-client-wrapper](./packages/kratos-client-wrapper/README.md) | A NestJS library to integrate [Ory Kratos](https://www.ory.sh/kratos/docs/) API                                        | [![npm](https://img.shields.io/npm/v/@getlarge/kratos-client-wrapper.svg?style=flat)](https://npmjs.org/package/@getlarge/kratos-client-wrapper) |
| [hydra-client-wrapper](./packages/hydra-client-wrapper/README.md)   | A NestJS library to integrate [Ory Hydra](https://www.ory.sh/hydra/docs/) API                                          | [![npm](https://img.shields.io/npm/v/@getlarge/hydra-client-wrapper.svg?style=flat)](https://npmjs.org/package/@getlarge/hydra-client-wrapper)   |
| [keto-cli](./packages/keto-cli/README.md)                           | A CLI to interact with the [Ory Keto](https://www.ory.sh/keto/docs/) API                                               | [![npm](https://img.shields.io/npm/v/@getlarge/keto-cli.svg?style=flat)](https://npmjs.org/package/@getlarge/keto-cli)                           |
| [kratos-cli](./packages/kratos-cli/README.md)                       | A CLI to interact with the [Ory Kratos](https://www.ory.sh/kratos/docs/) self-service API                              | [![npm](https://img.shields.io/npm/v/@getlarge/kratos-cli.svg?style=flat)](https://npmjs.org/package/@getlarge/kratos-cli)                       |

## Installation and usage

Check the README of each package for more details.

## Examples

Check out the following projects for examples of using these packages:

- [ticketing repository](https://github.com/getlarge/ticketing) is a real-world example of using Ory Kratos, Keto, and Hydra.
- [cat fostering repository](https://github.com/getlarge/cat-fostering) is a small-scale example of using Ory Kratos, Keto via Ory Network.

## Misc

You can read the [blog post](https://dev.to/getlarge/integrating-ory-in-production-with-nestjs-3nic) describing the journey of creating these libraries.
