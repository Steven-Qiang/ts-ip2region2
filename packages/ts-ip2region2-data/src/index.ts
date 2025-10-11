import * as path from 'path';
import * as fs from 'fs';

export interface DataPaths {
  v4: string;
  v6: string;
}

export function getDataPaths(): DataPaths {
  const dataDir = path.join(__dirname, '..', 'extracted');
  
  return {
    v4: path.join(dataDir, 'ip2region_v4.xdb'),
    v6: path.join(dataDir, 'ip2region_v6.xdb')
  };
}

export function isDataExtracted(): boolean {
  const paths = getDataPaths();
  return fs.existsSync(paths.v4) && fs.existsSync(paths.v6);
}