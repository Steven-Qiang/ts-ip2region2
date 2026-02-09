import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import semanticRelease from 'semantic-release';

function getPackageName() {
  const packageJson = JSON.parse(readFileSync('../package.json', 'utf8'));
  return packageJson.name;
}

function getNpmLatestVersion(packageName) {
  try {
    return execSync(`npm view ${packageName} version`, { encoding: 'utf8' }).trim();
  } catch {
    return '0.0.0';
  }
}

function isDryRun() {
  return process.argv.includes('--dry-run');
}

function getConfig() {
  const packageName = getPackageName();
  const npmLatestVersion = getNpmLatestVersion(packageName);

  console.log(`Package ${packageName} latest version on npm: ${npmLatestVersion}`);

  return {
    branches: ['main'],
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      [
        '@semantic-release/changelog',
        {
          changelogFile: 'CHANGELOG.md',
        },
      ],
      [
        '@semantic-release/npm',
        {
          npmPublish: true,
        },
      ],
      '@semantic-release/github',
      [
        '@semantic-release/git',
        {
          assets: ['CHANGELOG.md', 'package.json', 'data/checksums.json'],
          message: 'chore: release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
      ],
    ],
  };
}

(async () => {
  try {
    const config = isDryRun() ? { ...getConfig(), dryRun: true } : getConfig();
    console.log('Running semantic-release...');
    const result = await semanticRelease(config);
    if (result) {
      const { lastRelease, commits, nextRelease, releases } = result;
      console.log(
        `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`,
      );
      if (lastRelease.version) {
        console.log(`The last release was "${lastRelease.version}".`);
      }
      for (const release of releases) {
        console.log(`The release was published with plugin "${release.pluginName}".`);
      }
    } else {
      console.log('No release published.');
    }
  } catch (err) {
    console.error('The automated release failed with %O', err);
    process.exit(1);
  }
})();
