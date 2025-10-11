const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * @param {string} command
 * @param {string} cwd
 */
function runCommand(command, cwd) {
  console.log(`Running: ${command} in ${cwd}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to run: ${command}`);
    process.exit(1);
  }
}

/**
 * @param {string} packagePath
 * @param {string} depName
 * @param {string} version
 */
function updateWorkspaceDependency(packagePath, depName, version) {
  const pkgJsonPath = path.join(packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

  if (pkg.dependencies && pkg.dependencies[depName]) {
    pkg.dependencies[depName] = `^${version}`;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Updated ${depName} to ^${version}`);
  }
}

function publishPackages() {
  const rootDir = path.join(__dirname, '..');
  const dataPackagePath = path.join(rootDir, 'packages', 'ts-ip2region2-data');
  const mainPackagePath = path.join(rootDir, 'packages', 'ts-ip2region2');

  // Get data package version
  const dataPackageJson = JSON.parse(fs.readFileSync(path.join(dataPackagePath, 'package.json'), 'utf8'));
  const dataVersion = dataPackageJson.version;

  // Build all packages
  console.log('Building all packages...');
  runCommand('pnpm run build', rootDir);

  // Publish data package first
  console.log('Publishing ts-ip2region2-data...');
  runCommand('npm publish', dataPackagePath);

  // Update main package dependency
  console.log('Updating main package dependency...');
  updateWorkspaceDependency(mainPackagePath, 'ts-ip2region2-data', dataVersion);

  // Publish main package
  console.log('Publishing ts-ip2region2...');
  runCommand('npm publish', mainPackagePath);

  // Restore workspace dependency
  console.log('Restoring workspace dependency...');
  updateWorkspaceDependency(mainPackagePath, 'ts-ip2region2-data', 'workspace:*');

  console.log('All packages published successfully! 🎉');
}

publishPackages();
