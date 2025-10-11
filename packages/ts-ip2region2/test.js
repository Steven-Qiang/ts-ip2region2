const { Ip2Region } = require('.');
const path = require('path');

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
  }

  assert(condition, message) {
    if (condition) {
      console.log(`✓ ${message}`);
      this.passed++;
    } else {
      console.log(`✗ ${message}`);
      this.failed++;
    }
  }

  testFileVerification() {
    console.log('\n=== File Verification Tests ===');

    // Test invalid path
    const invalidResult = Ip2Region.verifyDetailed('./nonexistent.xdb');
    this.assert(!invalidResult.valid, 'Nonexistent file should be invalid');
    this.assert(invalidResult.errorCode === -1, 'Error code should be -1 for missing file');
  }

  testBasicQueries() {
    console.log('\n=== Basic Query Tests ===');

    const searcher = new Ip2Region(undefined, {
      cachePolicy: 'vectorIndex',
      ipVersion: 'v4',
    });

    const testIPs = [
      { ip: '8.8.8.8', expected: 'string' },
      { ip: '114.114.114.114', expected: 'string' },
      { ip: '1.1.1.1', expected: 'string' },
    ];

    testIPs.forEach(({ ip, expected }) => {
      const result = searcher.search(ip);
      this.assert(typeof result.region === expected, `${ip} should return region as ${expected}`);
      this.assert(typeof result.ioCount === 'number', `${ip} should return ioCount as number`);
      this.assert(typeof result.took === 'number', `${ip} should return took as number`);
      this.assert(result.took >= 0, `${ip} query time should be non-negative`);
    });

    searcher.close();
  }

  testCacheStrategies() {
    console.log('\n=== Cache Strategy Tests ===');

    const policies = ['file', 'vectorIndex', 'content'];
    const testIP = '8.8.8.8';

    policies.forEach((policy) => {
      try {
        const searcher = new Ip2Region(undefined, {
          cachePolicy: policy,
          ipVersion: 'v4',
        });

        const result = searcher.search(testIP);
        this.assert(result && result.region, `${policy} cache should return valid result`);

        searcher.close();
      } catch (error) {
        this.assert(false, `${policy} cache strategy failed: ${error.message}`);
      }
    });
  }

  testErrorHandling() {
    console.log('\n=== Error Handling Tests ===');

    // Test invalid database path
    try {
      new Ip2Region('./nonexistent.xdb');
      this.assert(false, 'Should throw error for invalid database path');
    } catch (error) {
      this.assert(true, 'Correctly throws error for invalid database path');
    }

    // Test invalid IP address
    const searcher = new Ip2Region();
    try {
      searcher.search('invalid.ip.address');
      this.assert(false, 'Should throw error for invalid IP address');
    } catch (error) {
      this.assert(true, 'Correctly throws error for invalid IP address');
    }
    searcher.close();

    // Test empty parameters
    try {
      Ip2Region.verify('');
      this.assert(false, 'Should throw error for empty path');
    } catch (error) {
      this.assert(true, 'Correctly throws error for empty path');
    }
  }

  run() {
    console.log('=== IP2Region Test Suite ===');

    this.testFileVerification();
    this.testBasicQueries();
    this.testCacheStrategies();
    this.testErrorHandling();

    console.log(`\n=== Test Results ===`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`Total:  ${this.passed + this.failed}`);

    if (this.failed > 0) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
    }
  }
}

if (require.main === module) {
  const runner = new TestRunner();
  runner.run();
}
