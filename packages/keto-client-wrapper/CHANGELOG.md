## 0.7.0 (2025-05-05)

### 🚀 Features

- add base-client-wrapper exports to hydra, keto, and kratos client wrappers ([7aac13f](https://github.com/getlarge/nestjs-ory-integration/commit/7aac13f))

### ❤️ Thank You

- getlarge

## 0.6.3 (2025-03-24)

### 🩹 Fixes

- update package.json exports to use .js and .d.ts extensions ([50c5dc1](https://github.com/getlarge/nestjs-ory-integration/commit/50c5dc1))

### 🧱 Updated Dependencies

- Updated keto-relations-parser to 0.0.13

### ❤️ Thank You

- getlarge

## 0.6.2 (2025-02-05)

### 🩹 Fixes

- solve Ory Keto config issue ([f39ec1b](https://github.com/getlarge/nestjs-ory-integration/commit/f39ec1b))

### ❤️ Thank You

- getlarge

## 0.6.1 (2025-02-01)

### 🩹 Fixes

- ensure typecheck is passing ([6d88022](https://github.com/getlarge/nestjs-ory-integration/commit/6d88022))

### 🧱 Updated Dependencies

- Updated keto-relations-parser to 0.0.12
- Updated base-client-wrapper to 0.1.8

### ❤️ Thank You

- getlarge

## 0.6.0 (2025-02-01)

### 🚀 Features

- **keto-client-wrapper:** add conditional support for batch permission checks ([117a2d1](https://github.com/getlarge/nestjs-ory-integration/commit/117a2d1))
- refactor OryAuthorizationGuard tests to use batchCheckPermission and improve logging ([96c0756](https://github.com/getlarge/nestjs-ory-integration/commit/96c0756))
- update OryAuthorizationGuard to use batchCheckPermission ([22d788c](https://github.com/getlarge/nestjs-ory-integration/commit/22d788c))

### 🩹 Fixes

- **keto-client-wrapper:** format code ([a88f1f3](https://github.com/getlarge/nestjs-ory-integration/commit/a88f1f3))
- **keto-client-wrapper:** update OryAuthorizationGuard to allow null type for parentType and fill empty array ([0828fdc](https://github.com/getlarge/nestjs-ory-integration/commit/0828fdc))
- **keto-client-wrapper:** enhance error handling for Axios errors in mock controller ([ae4aff0](https://github.com/getlarge/nestjs-ory-integration/commit/ae4aff0))
- **keto-client-wrapper:** update host configuration to allow external access ([7c7ef46](https://github.com/getlarge/nestjs-ory-integration/commit/7c7ef46))
- **keto-client-wrapper:** update healthcheck command and parameters in Dockerfile ([1daeefe](https://github.com/getlarge/nestjs-ory-integration/commit/1daeefe))
- **keto-client-wrapper:** increase retries in Dockerfile healthcheck ([acdb3c3](https://github.com/getlarge/nestjs-ory-integration/commit/acdb3c3))

### ❤️  Thank You

- getlarge

## 0.5.0 (2024-11-12)

### 🚀 Features

- **keto-client-wrapper:** export types ([dab1835](https://github.com/getlarge/nestjs-ory-integration/commit/dab1835))

### ❤️  Thank You

- getlarge

## 0.4.0 (2024-11-06)

### 🚀 Features

- **keto-client-wrapper:** enhance OryAuthorizationGuard to handle partial public access ([137aa70](https://github.com/getlarge/nestjs-ory-integration/commit/137aa70))

### ❤️  Thank You

- getlarge

## 0.3.3 (2024-10-08)

### 🧱 Updated Dependencies

- Updated keto-relations-parser to 0.0.11

## 0.3.2 (2024-10-07)

### 🩹 Fixes

- relax peer dependencies ([687b53b](https://github.com/getlarge/nestjs-ory-integration/commit/687b53b))

### ❤️  Thank You

- getlarge

## 0.3.1 (2024-10-07)

### 🧱 Updated Dependencies

- Updated keto-relations-parser to 0.0.10

## 0.3.0 (2024-06-04)


### 🚀 Features

- bind this (Guard instance) to the Guard options factories ([f1b7d85](https://github.com/getlarge/nestjs-ory-integration/commit/f1b7d85))


### ❤️  Thank You

- getlarge @getlarge

## 0.2.6 (2024-04-12)


### 🩹 Fixes

- **keto-client-wrapper:** enable passing access token to Ory Keto permission API ([40dd56e](https://github.com/getlarge/nestjs-ory-integration/commit/40dd56e))


### ❤️  Thank You

- getlarge @getlarge

## 0.2.5 (2024-04-05)


### 🚀 Features

- **keto-cli:** create CLI to interact with Keto API ([35ff1a6](https://github.com/getlarge/nestjs-ory-integration/commit/35ff1a6))

- **keto-client-wrapper:** allow override Ory client configuration ([7ad906d](https://github.com/getlarge/nestjs-ory-integration/commit/7ad906d))


### 🩹 Fixes

- update useFactory arguments to allow any type in ory-permissions, ory-relationships, ory-frontend, and ory-identities module interfaces ([b776b5d](https://github.com/getlarge/nestjs-ory-integration/commit/b776b5d))


### ❤️  Thank You

- Edouard @getlarge
- getlarge @getlarge

## 0.2.4 (2024-04-05)


### 🚀 Features

- **keto-cli:** create CLI to interact with Keto API ([35ff1a6](https://github.com/getlarge/nestjs-ory-integration/commit/35ff1a6))

- **keto-client-wrapper:** allow override Ory client configuration ([7ad906d](https://github.com/getlarge/nestjs-ory-integration/commit/7ad906d))


### 🩹 Fixes

- update useFactory arguments to allow any type in ory-permissions, ory-relationships, ory-frontend, and ory-identities module interfaces ([b776b5d](https://github.com/getlarge/nestjs-ory-integration/commit/b776b5d))


### ❤️  Thank You

- Edouard @getlarge
- getlarge @getlarge

## 0.2.3 (2024-04-05)


### 🚀 Features

- **keto-cli:** create CLI to interact with Keto API ([35ff1a6](https://github.com/getlarge/nestjs-ory-integration/commit/35ff1a6))

- **keto-client-wrapper:** allow override Ory client configuration ([7ad906d](https://github.com/getlarge/nestjs-ory-integration/commit/7ad906d))


### 🩹 Fixes

- update useFactory arguments to allow any type in ory-permissions, ory-relationships, ory-frontend, and ory-identities module interfaces ([b776b5d](https://github.com/getlarge/nestjs-ory-integration/commit/b776b5d))


### ❤️  Thank You

- Edouard @getlarge
- getlarge @getlarge

## 0.2.2 (2024-04-04)


### 🚀 Features

- **keto-cli:** create CLI to interact with Keto API ([35ff1a6](https://github.com/getlarge/nestjs-ory-integration/commit/35ff1a6))

- **keto-client-wrapper:** allow override Ory client configuration ([7ad906d](https://github.com/getlarge/nestjs-ory-integration/commit/7ad906d))


### 🩹 Fixes

- update useFactory arguments to allow any type in ory-permissions, ory-relationships, ory-frontend, and ory-identities module interfaces ([b776b5d](https://github.com/getlarge/nestjs-ory-integration/commit/b776b5d))


### ❤️  Thank You

- Edouard @getlarge
- getlarge @getlarge

## 0.2.1 (2024-04-03)


### 🚀 Features

- **keto-cli:** create CLI to interact with Keto API ([35ff1a6](https://github.com/getlarge/nestjs-ory-integration/commit/35ff1a6))

- **keto-client-wrapper:** allow override Ory client configuration ([7ad906d](https://github.com/getlarge/nestjs-ory-integration/commit/7ad906d))


### 🩹 Fixes

- update useFactory arguments to allow any type in ory-permissions, ory-relationships, ory-frontend, and ory-identities module interfaces ([b776b5d](https://github.com/getlarge/nestjs-ory-integration/commit/b776b5d))


### ❤️  Thank You

- Edouard @getlarge
- getlarge @getlarge

## 0.2.0 (2024-04-03)


### 🚀 Features

- **keto-client-wrapper:** support logic operators ([85bdce3](https://github.com/getlarge/nestjs-ory-integration/commit/85bdce3))


### 🩹 Fixes

- **keto-client-wrapper:** do NOT import injected class as type ([18ff575](https://github.com/getlarge/nestjs-ory-integration/commit/18ff575))


### ❤️  Thank You

- getlarge @getlarge

## 0.1.0 (2024-02-06)


### 🚀 Features

- **keto-client-wrapper:** create unauthorizedFactory option and improve error handling ([cfcd91e](https://github.com/getlarge/nestjs-ory-integration/commit/cfcd91e))


### 🩹 Fixes

- export isOryError ([6f4e32f](https://github.com/getlarge/nestjs-ory-integration/commit/6f4e32f))

- instantiate default HTTPException with empty constructor ([a542cbd](https://github.com/getlarge/nestjs-ory-integration/commit/a542cbd))


### ❤️  Thank You

- getlarge @getlarge

## 0.0.2 (2024-01-15)

### 🩹 Fixes

- **keto-relations-parser:** improve RelationTupleBuilder

### ❤️ Thank You

- getlarge

## 0.0.1 (2024-01-13)

### 🚀 Features

- create keto-client-wrapper

- **keto-client-wrapper:** create OryAuthorizationGuard

### 🩹 Fixes

- update OryAuthorizationGuard and OryAuthenticationGuard interfaces and options
