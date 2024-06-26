#!/usr/bin/env node
import { CommandFactory } from 'nest-commander';

import { version } from '../package.json';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  await CommandFactory.run(AppModule, {
    logger: process.env['DEBUG:KETO_CLI']
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['error', 'warn'],
    enablePositionalOptions: true,
    enablePassThroughOptions: true,
    cliName: '@getlarge/keto-cli',
    version,
    usePlugins: true,
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
