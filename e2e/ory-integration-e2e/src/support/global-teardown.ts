/* eslint-disable */

import { execSync } from 'node:child_process';

module.exports = async function () {
  execSync('docker-compose -f e2e/ory-integration/docker-compose.yml down');

  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
