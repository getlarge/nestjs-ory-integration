ARG NODE_VERSION=22

FROM node:$NODE_VERSION AS deps

WORKDIR /e2e/ory-integration

COPY ./package*.json ./

RUN npm install --omit=dev -f --loglevel=error --include=optional

RUN curl -sf https://gobinaries.com/tj/node-prune | sh
RUN node-prune

FROM node:$NODE_VERSION

USER node

ENV NODE_ENV=development

WORKDIR /e2e/ory-integration

COPY --from=deps --chown=node:node /e2e/ory-integration ./
COPY --chown=node:node ./dist/e2e/ory-integration ./

CMD ["node", "main.js"]
