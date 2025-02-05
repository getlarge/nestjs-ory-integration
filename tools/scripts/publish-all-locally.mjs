import { execFile, execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { parseArgs } from 'node:util';
import { releasePublish, releaseVersion } from 'nx/release/index.js';
import { readCachedProjectGraph } from 'nx/src/devkit-exports.js';

const args = process.argv.slice(2);

const { values } = parseArgs({
  args,
  strict: false,
  options: {
    targetPath: {
      type: 'string',
      default: 'e2e/ory-integration',
      short: 't',
    },
  },
});

const require = createRequire(import.meta.url);
const nx = require.resolve('nx/bin/nx.js');
const p = execFile(nx, [
  'run',
  '@source/nestjs-ory-integration:local-registry',
]);

try {
  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
  await setTimeout(1000);

  const { projectsVersionData } = await releaseVersion({
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    firstRelease: true,
    generatorOptionsOverrides: {
      skipLockFileUpdate: true,
    },
    verbose: false,
  });

  const publishStatus = await releasePublish({
    firstRelease: true,
    verbose: false,
    // tag: 'e2e',
  });

  console.log('Publish status', publishStatus);

  // Get All published Npm packages that should be installed
  const packagesToInstall = await Promise.all(
    Object.entries(projectsVersionData).map(
      async ([projectName, { currentVersion, newVersion }]) => {
        const project = readCachedProjectGraph().nodes[projectName];
        const fileOutput = await readFile(
          resolve(process.cwd(), project.data.root, `package.json`),
          'utf-8',
        );
        const packageJson = JSON.parse(fileOutput);
        return `${packageJson.name}@${newVersion ?? currentVersion}`;
      },
    ),
  );

  // Prepare the install command
  const targetPath = resolve(process.cwd(), values.targetPath);
  const installCommand = `npm --prefix ${targetPath} --registry http://localhost:4873 i ${packagesToInstall.join(' ')}`;

  console.log(installCommand);
  execSync(installCommand, {
    stdio: 'inherit',
  });
  // unfortunately, the process does not exit properly and verdaccio is not killed
  // execSync is working but it is also blocking the process
  p.kill('SIGTERM');
  await setTimeout(2000);
  process.exit(0);
} catch (error) {
  console.error(error);
  p.kill('SIGTERM');
  await setTimeout(2000);

  process.exit(1);
}
