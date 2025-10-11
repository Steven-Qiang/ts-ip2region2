import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import semanticRelease from 'semantic-release';

function getPackageName() {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  return packageJson.name;
}

/**
 * @param {string} packageName
 */
function getNpmLatestVersion(packageName) {
  try {
    return execSync(`npm view ${packageName} version`, { encoding: 'utf8' }).trim();
  } catch {
    return '0.0.0';
  }
}

/**
 * @return {Partial<import('semantic-release').GlobalConfig>}
 */
function getDryRunConfig() {
  const packageName = getPackageName();
  return {
    dryRun: true,
    repositoryUrl: getLocalRepoUrl(),
    branches: getCurrentBranch(),
    extends: 'semantic-release-monorepo',
    tagFormat: `${packageName}-v\${version}`,
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      [
        '@semantic-release/exec',
        {
          verifyReleaseCmd: 'npm version ${nextRelease.version} --no-git-tag-version',
        },
      ],
    ],
  };
}

/**
 * @return {Partial<import('semantic-release').GlobalConfig>}
 */
function getCIConfig() {
  const packageName = getPackageName();
  const npmLatestVersion = getNpmLatestVersion(packageName);

  console.log(`Package ${packageName} latest version on npm: ${npmLatestVersion}`);

  /** @type {Partial<import('semantic-release').GlobalConfig> & {plugins:import('semantic-release').PluginSpec[]}} */
  const config = {
    branches: ['main'],
    extends: 'semantic-release-monorepo',
    tagFormat: `${packageName}-v\${version}`,
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      [
        '@semantic-release/changelog',
        {
          changelogFile: 'CHANGELOG.md',
        },
      ],
      // 使用自定义插件来检查版本
      [
        '@semantic-release/exec',
        {
          verifyReleaseCmd: `node -e "const semver=require('semver');if(!semver.gt('\${nextRelease.version}','${npmLatestVersion}')){console.log('New version not greater than npm version, skipping npm publish');process.exit(0);}"`,
          publishCmd: 'npm publish',
        },
      ],
      '@semantic-release/github',
      [
        '@semantic-release/git',
        {
          assets: ['CHANGELOG.md', 'package.json', 'package-lock.json', 'data/checksums.json'],
          message: 'chore: release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
      ],
    ],
  };

  return config;
}
function isDryRun() {
  return process.argv.includes('--dry-run');
}

function getLocalRepoUrl() {
  const topLevelDir = execSync('git rev-parse --show-toplevel').toString().trim();

  return `file://${topLevelDir}/.git`;
}

function getCurrentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}

(async () => {
  try {
    const config = isDryRun() ? getDryRunConfig() : getCIConfig();
    console.log('config', config);
    const result = await semanticRelease(config);
    if (result) {
      const { lastRelease, commits, nextRelease, releases } = result;
      console.log(`Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`);
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
  }
})();
