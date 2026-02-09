// @ts-nocheck
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const ProgressBar = require('progress');
const { add } = require('node-7z');
const sevenBin = require('7zip-bin');

const DATA_URLS = {
  v4: 'https://github.com/lionsoul2014/ip2region/raw/refs/heads/master/data/ip2region_v4.xdb',
  v6: 'https://github.com/lionsoul2014/ip2region/raw/refs/heads/master/data/ip2region_v6.xdb',
};

const DATA_PATHS = {
  v4: 'data/ip2region_v4.xdb',
  v6: 'data/ip2region_v6.xdb',
};

const REPO_OWNER = 'lionsoul2014';
const REPO_NAME = 'ip2region';

const HASH_FILE = path.join(__dirname, '..', 'data', 'checksums.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Get latest commit SHA for a file from GitHub API
 * @param {string} filePath
 */
function getLatestCommitSha(filePath) {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?path=${filePath}&page=1&per_page=1`;
    
    https.get(url, { headers: { 'User-Agent': 'ts-ip2region2-sync' } }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode !== 200) {
          return reject(new Error(`GitHub API error: ${response.statusCode}`));
        }
        
        try {
          const commits = JSON.parse(data);
          if (commits.length > 0) {
            resolve(commits[0].sha);
          } else {
            reject(new Error('No commits found'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

/**
 * @param {string} url
 * @param {string} filepath
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(filepath);
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      const progressBar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 40,
        total: totalSize,
      });

      response.on('data', (chunk) => {
        progressBar.tick(chunk.length);
      });

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

/**
 * @param {fs.PathOrFileDescriptor} filepath
 */
function calculateHash(filepath) {
  const data = fs.readFileSync(filepath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function compressFiles() {
  const archivePath = path.join(DATA_DIR, 'ip2region.7z');

  if (fs.existsSync(archivePath)) {
    fs.unlinkSync(archivePath);
  }

  const stream = add(archivePath, [path.join(DATA_DIR, 'ip2region_v4.xdb'), path.join(DATA_DIR, 'ip2region_v6.xdb')], {
    $bin: sevenBin.path7za,
    mx: 9,
  });

  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

async function syncData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let currentHashes = {};
  if (fs.existsSync(HASH_FILE)) {
    currentHashes = JSON.parse(fs.readFileSync(HASH_FILE, 'utf8'));
  }

  let hasChanges = false;
  const newHashes = {};

  // Check commit SHAs first
  console.log('Checking for updates via GitHub API...');
  for (const [version, filePath] of Object.entries(DATA_PATHS)) {
    try {
      const commitSha = await getLatestCommitSha(filePath);
      newHashes[version] = commitSha;
      
      console.log(`${filePath}:`);
      console.log(`  Current: ${currentHashes[version] || 'none'}`);
      console.log(`  Latest:  ${commitSha}`);
      
      if (currentHashes[version] !== commitSha) {
        console.log(`  Status: UPDATE NEEDED`);
        hasChanges = true;
      } else {
        console.log(`  Status: up-to-date`);
      }
    } catch (err) {
      console.error(`Failed to check ${filePath}: ${err.message}`);
      throw err;
    }
  }

  if (!hasChanges) {
    console.log('\nNo updates needed.');
    return false;
  }

  // Download and compress if there are changes
  console.log('\nDownloading updated files...');
  for (const [version, url] of Object.entries(DATA_URLS)) {
    const filename = `ip2region_${version}.xdb`;
    const filepath = path.join(DATA_DIR, filename);
    
    console.log(`Downloading ${filename}...`);
    await downloadFile(url, filepath);
  }

  console.log('\nCompressing files...');
  await compressFiles();

  fs.writeFileSync(HASH_FILE, JSON.stringify(newHashes, null, 2) + '\n');
  console.log('Data synchronized and compressed');

  // Clean up xdb files
  for (const version of Object.keys(DATA_URLS)) {
    const filepath = path.join(DATA_DIR, `ip2region_${version}.xdb`);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  return true;
}

if (require.main === module) {
  const noExitCode = process.argv.includes('--no-exit-code');
  syncData()
    .then((hasChanges) => {
      process.exit(noExitCode ? 0 : hasChanges ? 0 : 1);
    })
    .catch(console.error);
}

module.exports = { syncData };
