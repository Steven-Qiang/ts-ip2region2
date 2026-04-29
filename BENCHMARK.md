# ts-ip2region2 Performance Benchmark Report

## Test Environment

- **Operating System**: win32 x64
- **Node.js Version**: v24.12.0
- **Database File**: ip2region_v4.xdb
- **Test Date**: 2026-04-29T06:08:32.998Z

## Test Configuration

- **Test IP Count**: 10 different IPs
- **Iterations per Strategy**: 10,000
- **Test IP List**: 8.8.8.8, 114.114.114.114, 1.1.1.1, 223.5.5.5, 120.229.45.2, 180.76.76.76, 61.135.169.121, 202.108.22.5, 211.136.112.200, 58.220.2.140

## Performance Test Results

| Cache Strategy | Total Time(μs) | Avg Time(μs/op) | Avg IO Count | QPS |
|---------------|-----------------|------------------|--------------|-----|
| file | 167673 | 16.77 | 4.20 | 59640 |
| vectorIndex | 125168 | 12.52 | 3.20 | 79892 |
| content | 12366 | 1.24 | 0.00 | 808695 |

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

- vectorIndex is 33.9% faster than file mode
- content is 909.7% faster than vectorIndex mode
- content is 1252.4% faster than file mode

## Conclusion

content mode provides the best performance with an average query time of 1.24μs and QPS of 808695.
For most application scenarios, we recommend using vectorIndex mode, which achieves a good balance between performance and memory usage.
