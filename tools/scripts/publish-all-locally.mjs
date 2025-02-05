import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { parseArgs } from 'node:util';
import { releasePublish, releaseVersion } from 'nx/release';

const localRegistryTarget = 'nestjs-ory-integration:local-registry';

const args = process.argv.slice(2);

const { value } = parseArgs({
  args,
  strict: false,
  tokens: true,
  config: {
    version: {
      type: 'string',
      default: `0.0.0-local.${Date.now()}`,
      short: 'v',
    },
    targetPath: {
      type: 'string',
      default: 'e2e/nestjs-ory-integration',
      short: 't',
    },
  },
});

try {
  const storage = './tmp/local-registry/storage';
  global.stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: false,
  });

  const { projectsVersionData } = await releaseVersion({
    specifier: value.version,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    firstRelease: true,
    generatorOptionsOverrides: {
      skipLockFileUpdate: true,
    },
  });

  const publishStatus = await releasePublish({
    firstRelease: true,
    registry: 'http://localhost:4873',
  });

  // Get All published Npm packages that should be installed
  const packagesToInstall = Object.entries(projectsVersionData).map(
    ([projectName, { newVersion }]) => {
      const project = readCachedProjectGraph().nodes[projectName];

      const packageJson = JSON.parse(
        readFileSync(
          resolve(process.cwd(), project.data.root, `package.json`),
        ).toString(),
      );

      return `${packageJson.name}@${newVersion}`;
    },
  );

  // Prepare the install command
  const targetPath = resolve(process.cwd(), value.targetPath);
  const installCommand = `npm --prefix ${targetPath} i ${packagesToInstall.join(' ')} --registry=http://localhost:4873`;

  console.log(installCommand);

  execSync(installCommand);

  global.stopLocalRegistry();

  process.exit(publishStatus);
} catch (error) {
  console.error(error);
  global.stopLocalRegistry();
  process.exit(1);
}
