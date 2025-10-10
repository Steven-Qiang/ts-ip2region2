# ip2region Node.js (TypeScript)

[English](README.md) | [中文](README_CN.md)

High-performance Node.js native addon for ip2region xdb query with IPv4/IPv6 support. Written in TypeScript with full type definitions.

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

> **Database Required**: Download the xdb database files from [ip2region data](https://github.com/lionsoul2014/ip2region/tree/master/data) before using.

## Quick Start

```typescript
import { Ip2Region } from 'ts-ip2region2';

// Create searcher instance
const searcher = new Ip2Region('./data/ip2region_v4.xdb', {
  cachePolicy: 'vectorIndex', // file/vectorIndex/content
  ipVersion: 'v4', // v4/v6
});

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
new Ip2Region(dbPath: string, options?: Ip2RegionOptions)
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

## Project Structure

```
ts-ip2region2/
├── src/                       # TypeScript source code
│   └── index.ts              # Main TypeScript API
├── dist/                      # Compiled JavaScript output
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── data/                      # Sample xdb database files
│   ├── ip2region_v4.xdb
│   └── ip2region_v6.xdb
├── ip2region/                 # Original ip2region C source code
│   ├── xdb_api.h
│   ├── xdb_util.c
│   └── xdb_searcher.c
├── addon.cpp                  # Node.js addon implementation
├── binding.gyp                # Build configuration
├── example.js                 # JavaScript example
├── test.js                    # JavaScript tests
├── tsconfig.json              # TypeScript configuration
├── package.json
└── README.md
```

## License

Apache-2.0
