# ts-ip2region2 Performance Benchmark Report

## Test Environment

- **Operating System**: win32 x64
- **Node.js Version**: v22.14.0
- **Database File**: ip2region_v4.xdb
- **Test Date**: 2025-11-29T18:21:40.990Z

## Test Configuration

- **Test IP Count**: 10 different IPs
- **Iterations per Strategy**: 10,000
- **Test IP List**: 8.8.8.8, 114.114.114.114, 1.1.1.1, 223.5.5.5, 120.229.45.2, 180.76.76.76, 61.135.169.121, 202.108.22.5, 211.136.112.200, 58.220.2.140

## Performance Test Results

| Cache Strategy | Total Time(μs) | Avg Time(μs/op) | Avg IO Count | QPS |
|---------------|-----------------|------------------|--------------|-----|
| file | 292822 | 29.28 | 4.70 | 34150 |
| vectorIndex | 220417 | 22.04 | 3.70 | 45369 |
| content | 12672 | 1.27 | 0.00 | 789148 |

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

- vectorIndex is 32.8% faster than file mode
- content is 1635.4% faster than vectorIndex mode
- content is 2205.5% faster than file mode

## Conclusion

content mode provides the best performance with an average query time of 1.27μs and QPS of 789148.
For most application scenarios, we recommend using vectorIndex mode, which achieves a good balance between performance and memory usage.
