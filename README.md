# ts-ip2region2 Monorepo

[English](README.md) | [中文](README_CN.md)

Monorepo for ts-ip2region2 packages - High-performance Node.js native addon for ip2region xdb query with IPv4/IPv6 support.

## Packages

- [`ts-ip2region2`](./packages/ts-ip2region2) - Main library package
- [`ts-ip2region2-data`](./packages/ts-ip2region2-data) - Compressed database files

> **Note**: This project is adapted from the official [ip2region C binding](https://github.com/lionsoul2014/ip2region/tree/master/binding/c) and enhanced with TypeScript support.

## Features

- 🚀 **High Performance** - Native C++ implementation with microsecond-level response
- 🌐 **IPv4 & IPv6** - Full support for both IPv4 and IPv6 address queries
- 💾 **Multiple Cache Strategies** - file/vectorIndex/content caching options
- 🔒 **Memory Safe** - Automatic resource management prevents memory leaks
- 📝 **TypeScript** - Complete TypeScript type definitions included
- 🔧 **Cross Platform** - Works on Windows, Linux, and macOS

## Installation

```bash
npm install ts-ip2region2
# or
pnpm add ts-ip2region2
# or
yarn add ts-ip2region2
```

> **Database Included**: Database files are now bundled and automatically extracted during installation.

## Quick Start

```typescript
import { Ip2Region } from 'ts-ip2region2';

// Create searcher instance (uses bundled data)
const searcher = new Ip2Region();

// Query IP address
const result = searcher.search('120.229.45.2');
console.log(result);
// Output: { region: '中国|广东省|深圳市|移动', ioCount: 3, took: 1000 }

// Clean up
searcher.close();
```

## API Reference

### Constructor

```typescript
new Ip2Region(dbPath?: string, options?: Ip2RegionOptions)
```

### Methods

- `search(ip: string): SearchResult` - Query IP address location
- `close(): void` - Release resources

### Static Methods

- `Ip2Region.verify(dbPath: string): boolean` - Verify xdb file
- `Ip2Region.verifyDetailed(dbPath: string): VerifyResult` - Verify with detailed info

### Types

```typescript
interface SearchResult {
  region: string; // Geographic location
  ioCount: number; // IO operation count
  took: number; // Query time in microseconds
}

interface Ip2RegionOptions {
  cachePolicy?: 'file' | 'vectorIndex' | 'content';
  ipVersion?: 'v4' | 'v6';
}
```

## Cache Strategies

| Strategy      | Memory  | Performance | Use Case                  |
| ------------- | ------- | ----------- | ------------------------- |
| `file`        | Minimal | Good        | Memory-constrained        |
| `vectorIndex` | Medium  | Better      | General use (recommended) |
| `content`     | High    | Best        | High-concurrency          |

## Examples

```bash
# Build and run example
npm run example

# Build and run tests
npm test

# Build native addon
npm run build

# Compile TypeScript
npm run compile
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Publish all packages
pnpm run publish:all
```

## Project Structure

```
ts-ip2region2/
├── packages/
│   ├── ts-ip2region2/         # Main library package
│   │   ├── src/
│   │   ├── ip2region/
│   │   ├── addon.cpp
│   │   ├── binding.gyp
│   │   └── package.json
│   └── ts-ip2region2-data/    # Database package
│       ├── src/
│       ├── data/
│       └── package.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## License

Apache-2.0
