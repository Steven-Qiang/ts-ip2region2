const { Ip2Region } = require('../dist');
const path = require('path');
const fs = require('fs');

// Find database file
const possiblePaths = [
  path.join(__dirname, '..', 'extracted', 'ip2region_v4.xdb'),
  path.join(__dirname, '..', 'data', 'ip2region_v4.xdb'),
];

let dbPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    dbPath = p;
    break;
  }
}

if (!dbPath) {
  console.error('Database file not found');
  process.exit(1);
}

// Test IP list
const testIPs = [
  '8.8.8.8',
  '114.114.114.114',
  '1.1.1.1',
  '223.5.5.5',
  '120.229.45.2',
  '180.76.76.76',
  '61.135.169.121',
  '202.108.22.5',
  '211.136.112.200',
  '58.220.2.140',
];

function benchmark(cachePolicy, iterations = 10000) {
  const searcher = new Ip2Region(dbPath, { cachePolicy });

  const startTime = process.hrtime.bigint();
  let totalIOCount = 0;

  for (let i = 0; i < iterations; i++) {
    const ip = testIPs[i % testIPs.length];
    const result = searcher.search(ip);
    totalIOCount += result.ioCount;
  }

  const endTime = process.hrtime.bigint();
  const totalTime = Number(endTime - startTime) / 1000;

  searcher.close();

  return {
    cachePolicy,
    iterations,
    totalTime: totalTime.toFixed(0),
    avgTime: (totalTime / iterations).toFixed(2),
    avgIOCount: (totalIOCount / iterations).toFixed(2),
    qps: (iterations / (totalTime / 1000000)).toFixed(0),
  };
}

console.log('=== ts-ip2region2 Performance Benchmark ===\n');
console.log(`Database: ${dbPath}`);
console.log(`Test IP count: ${testIPs.length}`);
console.log(`Iterations per strategy: 10000\n`);

const results = [];

// Test three cache strategies
['file', 'vectorIndex', 'content'].forEach((policy) => {
  console.log(`Testing ${policy} cache policy...`);
  const result = benchmark(policy);
  results.push(result);
  console.log(`Completed: avg ${result.avgTime}μs/op, QPS: ${result.qps}\n`);
});

// Generate Markdown report
const mdContent = `# ts-ip2region2 Performance Benchmark Report

## Test Environment

- **Operating System**: ${process.platform} ${process.arch}
- **Node.js Version**: ${process.version}
- **Database File**: ip2region_v4.xdb
- **Test Date**: ${new Date().toISOString()}

## Test Configuration

- **Test IP Count**: ${testIPs.length} different IPs
- **Iterations per Strategy**: 10,000
- **Test IP List**: ${testIPs.join(', ')}

## Performance Test Results

| Cache Strategy | Total Time(μs) | Avg Time(μs/op) | Avg IO Count | QPS |
|---------------|-----------------|------------------|--------------|-----|
${results.map((r) => `| ${r.cachePolicy} | ${r.totalTime} | ${r.avgTime} | ${r.avgIOCount} | ${r.qps} |`).join('\n')}

## Cache Strategy Description

### file mode
- **Performance**: Good
- **Use Case**: Memory-constrained environments

### vectorIndex mode
- **Performance**: Better
- **Use Case**: General scenarios (recommended)

### content mode
- **Performance**: Best
- **Use Case**: High-concurrency scenarios

## Performance Comparison

- vectorIndex is ${((results[0].avgTime / results[1].avgTime - 1) * 100).toFixed(1)}% faster than file mode
- content is ${((results[1].avgTime / results[2].avgTime - 1) * 100).toFixed(1)}% faster than vectorIndex mode
- content is ${((results[0].avgTime / results[2].avgTime - 1) * 100).toFixed(1)}% faster than file mode

## Conclusion

${results[2].cachePolicy} mode provides the best performance with an average query time of ${results[2].avgTime}μs and QPS of ${results[2].qps}.
For most application scenarios, we recommend using ${results[1].cachePolicy} mode, which achieves a good balance between performance and memory usage.
`;

fs.writeFileSync(path.join(__dirname, '..', 'BENCHMARK.md'), mdContent);
console.log('✓ Performance benchmark report generated: BENCHMARK.md');
