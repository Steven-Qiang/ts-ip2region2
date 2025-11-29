# ip2region Node.js (TypeScript)

[English](README.md) | [中文](README_CN.md)

高性能的 ip2region xdb 查询 Node.js 原生扩展，支持 IPv4/IPv6。使用 TypeScript 编写，包含完整的类型定义。

> **说明**: 本项目基于官方 [ip2region C 语言客户端](https://github.com/lionsoul2014/ip2region/tree/master/binding/c) 改造，并增强了 TypeScript 支持。

## 特性

- 🚀 **高性能** - 原生 C++ 实现，微秒级响应
- 🌐 **IPv4 & IPv6** - 完全支持 IPv4 和 IPv6 地址查询
- 💾 **多种缓存策略** - file/vectorIndex/content 缓存选项
- 🔒 **内存安全** - 自动资源管理，防止内存泄漏
- 📝 **TypeScript** - 包含完整的 TypeScript 类型定义
- 🔧 **跨平台** - 支持 Windows、Linux 和 macOS

## 安装

```bash
npm install ts-ip2region2
# or
pnpm add ts-ip2region2
# or
yarn add ts-ip2region2
```

> **数据库已包含**: 数据库文件现已内置，安装时会自动提取。

## 快速开始

```typescript
import { Ip2Region } from 'ts-ip2region2';

// 创建查询器实例（使用内置数据）
const searcher = new Ip2Region();

// 或者使用选项
const searcher2 = new Ip2Region({ cachePolicy: 'content', ipVersion: 'v6' });

// 查询IP地址
const result = searcher.search('120.229.45.2');
console.log(result);
// 输出: { region: '中国|广东省|深圳市|移动', ioCount: 3, took: 1000 }

// 清理资源
searcher.close();
```

## API 参考

### 构造函数

```typescript
// 使用默认内置数据
new Ip2Region()
new Ip2Region(options: Ip2RegionOptions)

// 使用自定义数据库
new Ip2Region(dbPath: string, options?: Ip2RegionOptions)
```

### 方法

- `search(ip: string): SearchResult` - 查询 IP 地址位置
- `close(): void` - 释放资源

### 静态方法

- `Ip2Region.verify(dbPath: string): boolean` - 验证 xdb 文件
- `Ip2Region.verifyDetailed(dbPath: string): VerifyResult` - 验证并返回详细信息

### 类型定义

```typescript
interface SearchResult {
  region: string; // 地理位置
  ioCount: number; // IO操作次数
  took: number; // 查询耗时(微秒)
}

interface Ip2RegionOptions {
  cachePolicy?: 'file' | 'vectorIndex' | 'content';
  ipVersion?: 'v4' | 'v6';
}
```

## 缓存策略

| 策略          | 性能 | 使用场景       |
| ------------- | ---- | -------------- |
| `file`        | 良好 | 内存受限环境   |
| `vectorIndex` | 更好 | 一般使用(推荐) |
| `content`     | 最佳 | 高并发场景     |

## 性能测试

在 Windows x64 + Node.js v22.14.0 环境下的测试结果（10,000次迭代）：

| 缓存策略 | 平均耗时 (μs/op) | QPS |
|---------|------------------|-----|
| file | ~31 | ~32,000 |
| vectorIndex | ~22 | ~45,000 |
| content | ~1.3 | ~750,000 |

**性能提升：**
- vectorIndex 比 file 模式快约 40%
- content 比 vectorIndex 模式快约 95%
- content 比 file 模式快约 96%

**与原生C对比：**
- 原生C (vectorIndex): ~5 μs/op
- Node.js扩展 (vectorIndex): ~22 μs/op
- 开销: 约4.4倍（主要来自N-API调用开销）

尽管存在N-API开销，但性能仍然非常出色，vectorIndex模式可达到45,000+ QPS。

**推荐：** 大多数场景使用 `vectorIndex` 模式，它在性能和内存占用之间取得了良好的平衡。

运行性能测试：
```bash
cd packages/ts-ip2region2
npm run benchmark
```

## 示例

```bash
# 构建并运行示例
npm run example

# 构建并运行测试
npm test

# 构建原生扩展
npm run build

# 编译 TypeScript
npm run compile
```

## 项目结构

```
ts-ip2region2/
├── src/                       # TypeScript 源代码
│   └── index.ts              # 主要 TypeScript API
├── dist/                      # 编译后的 JavaScript 输出
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── data/                      # 示例 xdb 数据库文件
│   ├── ip2region_v4.xdb
│   └── ip2region_v6.xdb
├── ip2region/                 # 原始 ip2region C 源代码
│   ├── xdb_api.h
│   ├── xdb_util.c
│   └── xdb_searcher.c
├── addon.cpp                  # Node.js 扩展实现
├── binding.gyp                # 构建配置
├── example.js                 # JavaScript 示例
├── test.js                    # JavaScript 测试
├── tsconfig.json              # TypeScript 配置
├── package.json
└── README.md
```

## 许可证

Apache-2.0
