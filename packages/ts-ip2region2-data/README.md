# ts-ip2region2-data

Compressed ip2region database files for ts-ip2region2.

This package contains the compressed xdb database files and automatically extracts them during installation.

## Installation

```bash
npm install ts-ip2region2-data
```

## Usage

```typescript
import { getDataPaths, isDataExtracted } from 'ts-ip2region2-data';

// Check if data is extracted
if (isDataExtracted()) {
  const paths = getDataPaths();
  console.log('IPv4 database:', paths.v4);
  console.log('IPv6 database:', paths.v6);
}
```

## API

- `getDataPaths()`: Returns paths to extracted database files
- `isDataExtracted()`: Checks if database files are extracted

## License

Apache-2.0