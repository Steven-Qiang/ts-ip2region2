import * as path from 'path';
import * as fs from 'fs';
const { extractFull } = require('node-7z');
const sevenBin = require('7zip-bin');

async function extractData(): Promise<void> {
  const packageDir = path.dirname(__dirname);
  const archivePath = path.join(packageDir, 'data', 'ip2region.7z');
  const extractDir = path.join(packageDir, 'extracted');

  if (!fs.existsSync(archivePath)) {
    console.error('Archive file not found:', archivePath);
    process.exit(1);
  }

  if (fs.existsSync(extractDir)) {
    console.log('Data already extracted');
    return;
  }

  console.log('Extracting ip2region database files...');
  
  try {
    fs.mkdirSync(extractDir, { recursive: true });
    
    const stream = extractFull(archivePath, extractDir, {
      $bin: sevenBin.path7za,
      recursive: true
    });

    await new Promise<void>((resolve, reject) => {
      stream.on('end', () => {
        console.log('Extraction completed successfully');
        resolve();
      });
      
      stream.on('error', (err: any) => {
        console.error('Extraction failed:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Failed to extract data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  extractData().catch(console.error);
}