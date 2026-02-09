const { Ip2Region } = require('.');
const path = require('path');

// Example usage
function runExample() {
  console.log('=== IP2Region Example ===\n');

  const ipv4DbPath = path.join(__dirname, './data/ip2region_v4.xdb');

  // Verify database file first
  if (!Ip2Region.verify(ipv4DbPath)) {
    console.error('Database file verification failed');
    return;
  }

  const searcher = new Ip2Region(ipv4DbPath, {
    cachePolicy: 'vectorIndex',
    ipVersion: 'v4',
  });

  // Test multiple IP addresses
  const testIPs = ['8.8.8.8', '114.114.114.114', '120.229.45.2', '223.5.5.5'];

  console.log('IPv4 Query Results:');
  testIPs.forEach((ip) => {
    const result = searcher.search(ip);
    console.log(`${ip.padEnd(15)} -> ${result.region} (${result.took}μs, IO:${result.ioCount})`);
  });

  searcher.close();

  // Try IPv6 if available
  const ipv6DbPath = path.join(__dirname, './data/ip2region_v6.xdb');

  if (Ip2Region.verify(ipv6DbPath)) {
    const ipv6Searcher = new Ip2Region(ipv6DbPath, {
      cachePolicy: 'vectorIndex',
      ipVersion: 'v6',
    });

    console.log('\nIPv6 Query Results:');
    const ipv6Result = ipv6Searcher.search('2001:4860:4860::8888');
    console.log(`2001:4860:4860::8888 -> ${ipv6Result.region} (${ipv6Result.took}μs)`);

    ipv6Searcher.close();
  } else {
    console.log('\nIPv6 database not available');
  }
}

// Performance benchmark
function runBenchmark() {
  console.log('\n=== Performance Benchmark ===');
  /** @type {('file' | 'vectorIndex' | 'content')[]} */
  const policies = ['content', 'file', 'vectorIndex'];
  const testIP = '8.8.8.8';
  const iterations = 10000;

  policies.forEach((policy) => {
    const searcher = new Ip2Region({ cachePolicy: policy });

    const startTime = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      searcher.search(testIP);
    }
    const endTime = process.hrtime.bigint();

    const duration = Number(endTime - startTime) / 1000000; // Convert to ms
    console.log(`${policy.padEnd(12)}: ${iterations} queries in ${duration.toFixed(2)}ms (${(duration / iterations).toFixed(3)}ms/query)`);

    searcher.close();
  });
}

// Run examples
if (require.main === module) {
  try {
    runExample();
    runBenchmark();
  } catch (error) {
    // @ts-ignore
    console.error('Error:', error.message);
    process.exit(1);
  }
}
