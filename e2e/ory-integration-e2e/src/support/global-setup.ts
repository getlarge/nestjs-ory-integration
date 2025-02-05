import { execSync } from 'node:child_process';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  console.log('\nSetting up...\n');
  // publish and link all packages
  execSync('node tools/scripts/publish-all-locally.mjs');
  // build API and Ory images
  execSync('npx nx run-many -t docker-push');
  // start Ory services and API
  execSync(
    'docker-compose -f e2e/ory-integration/docker-compose.yml up -d --wait',
  );

  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
