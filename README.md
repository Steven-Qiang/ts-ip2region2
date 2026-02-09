# ts-ip2region2

[![npm version](https://badge.fury.io/js/ts-ip2region2.svg)](https://badge.fury.io/js/ts-ip2region2)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js CI](https://github.com/Steven-Qiang/ts-ip2region2/workflows/Release/badge.svg)](https://github.com/Steven-Qiang/ts-ip2region2/actions)

[English](README.md) | [中文](README_CN.md)

High-performance Node.js native addon for ip2region xdb query with IPv4/IPv6 support. Written in TypeScript with full type definitions.

> **Note**: This project is based on the official [ip2region C client](https://github.com/lionsoul2014/ip2region/tree/master/binding/c) with enhanced TypeScript support.

## Features

- 🚀 **High Performance** - Native C++ implementation with microsecond-level response
- 🌐 **IPv4 & IPv6** - Full support for both IPv4 and IPv6 address queries
- 💾 **Multiple Cache Strategies** - file/vectorIndex/content caching options
- 🔒 **Memory Safe** - Automatic resource management prevents memory leaks
- 📝 **TypeScript** - Complete TypeScript type definitions included
- 🔧 **Cross Platform** - Works on Windows, Linux, and macOS
- 📦 **Auto-Updated Data** - Database files are automatically synced daily

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

// Or with options
const searcher2 = new Ip2Region({ cachePolicy: 'content', ipVersion: 'v6' });

// Or specify custom database path
const searcher3 = new Ip2Region('./custom.xdb', {
  cachePolicy: 'vectorIndex',
  ipVersion: 'v4'
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
// Using default bundled data
new Ip2Region()
new Ip2Region(options: Ip2RegionOptions)

// Using custom database
new Ip2Region(dbPath: string, options?: Ip2RegionOptions)
```

### Methods

- `search(ip: string): SearchResult` - Query IP address location
- `close(): void` - Release resources

### Static Methods

- `Ip2Region.verify(dbPath: string): boolean` - Verify xdb file
- `Ip2Region.verifyDetailed(dbPath: string): VerifyResult` - Verify with detailed info

### Type Definitions

```typescript
interface SearchResult {
  region: string; // Geographic location
  ioCount: number; // Number of IO operations
  took: number; // Query time in microseconds
}

interface Ip2RegionOptions {
  cachePolicy?: 'file' | 'vectorIndex' | 'content';
  ipVersion?: 'v4' | 'v6';
}
```

## Cache Strategies

| Strategy | Performance | Use Case |
|----------|-------------|----------|
| `file` | Good | Memory-constrained environments |
| `vectorIndex` | Better | General use (recommended) |
| `content` | Best | High-concurrency scenarios |

## Performance Benchmark

Benchmark results on Windows x64 with Node.js v22.14.0 (10,000 iterations):

| Cache Strategy | Avg Time (μs/op) | QPS |
|---------------|------------------|-----|
| file | ~31 | ~32,000 |
| vectorIndex | ~22 | ~45,000 |
| content | ~1.3 | ~750,000 |

**Performance Improvements:**
- vectorIndex is ~40% faster than file mode
- content is ~95% faster than vectorIndex mode
- content is ~96% faster than file mode

**Comparison with Native C:**
- Native C (vectorIndex): ~5 μs/op
- Node.js Addon (vectorIndex): ~22 μs/op
- Overhead: ~4.4x (mainly from N-API call overhead)

Despite the N-API overhead, the performance is still excellent for most use cases, achieving 45,000+ QPS with vectorIndex mode.

**Recommendation:** Use `vectorIndex` for most scenarios as it provides excellent performance with moderate memory usage.

Run benchmark yourself:
```bash
npm run benchmark
```

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
├── data/                      # Bundled xdb database files
│   ├── checksums.json
│   └── ip2region.7z
├── extracted/                 # Extracted database files
│   ├── ip2region_v4.xdb
│   └── ip2region_v6.xdb
├── ip2region/                 # Original ip2region C source
│   ├── xdb_api.h
│   ├── xdb_util.c
│   └── xdb_searcher.c
├── scripts/                   # Build and utility scripts
├── addon.cpp                  # Node.js addon implementation
├── binding.gyp                # Build configuration
├── example.js                 # JavaScript example
├── tsconfig.json              # TypeScript configuration
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache-2.0