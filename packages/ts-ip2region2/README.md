# ts-ip2region2

High-performance Node.js native addon for ip2region xdb query with IPv4/IPv6 support. Written in TypeScript with full type definitions.

## Features

- 🚀 **High Performance** - Native C++ implementation with microsecond-level response
- 🌐 **IPv4 & IPv6** - Full support for both IPv4 and IPv6 address queries
- 💾 **Multiple Cache Strategies** - file/vectorIndex/content caching options
- 🔒 **Memory Safe** - Automatic resource management prevents memory leaks
- 📝 **TypeScript** - Complete TypeScript type definitions included
- 🔧 **Cross Platform** - Works on Windows, Linux, and macOS
- 📦 **Bundled Data** - Includes compressed database files

## Installation

```bash
npm install ts-ip2region2
```

The database files are automatically included and extracted during installation.

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

## License

Apache-2.0