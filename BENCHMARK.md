# ts-ip2region2 Performance Benchmark Report

## Test Environment

- **Operating System**: win32 x64
- **Node.js Version**: v24.12.0
- **Database File**: ip2region_v4.xdb
- **Test Date**: 2026-02-09T18:51:59.454Z

## Test Configuration

- **Test IP Count**: 10 different IPs
- **Iterations per Strategy**: 10,000
- **Test IP List**: 8.8.8.8, 114.114.114.114, 1.1.1.1, 223.5.5.5, 120.229.45.2, 180.76.76.76, 61.135.169.121, 202.108.22.5, 211.136.112.200, 58.220.2.140

## Performance Test Results

| Cache Strategy | Total Time(μs) | Avg Time(μs/op) | Avg IO Count | QPS |
|---------------|-----------------|------------------|--------------|-----|
| file | 169223 | 16.92 | 4.20 | 59094 |
| vectorIndex | 123489 | 12.35 | 3.20 | 80979 |
| content | 11922 | 1.19 | 0.00 | 838778 |

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

- vectorIndex is 37.0% faster than file mode
- content is 937.8% faster than vectorIndex mode
- content is 1321.8% faster than file mode

## Conclusion

content mode provides the best performance with an average query time of 1.19μs and QPS of 838778.
For most application scenarios, we recommend using vectorIndex mode, which achieves a good balance between performance and memory usage.
