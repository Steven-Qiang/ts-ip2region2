const { execSync } = require('child_process');
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

function manualPublish() {
  const rootDir = path.join(__dirname, '..');
  const dataPackagePath = path.join(rootDir, 'packages', 'ts-ip2region2-data');
  
  // Sync data first
  console.log('Syncing data...');
  try {
    runCommand('npm run sync', dataPackagePath);
    console.log('Data updated, proceeding with publish...');
  } catch (error) {
    console.log('No data changes, publishing current version...');
  }
  
  // Build and publish
  console.log('Building and publishing packages...');
  runCommand('pnpm run build', rootDir);
  runCommand('pnpm run publish:all', rootDir);
  
  console.log('Manual publish completed! 🎉');
}

manualPublish();