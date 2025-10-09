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

> **需要数据库**: 使用前请从 [ip2region data](https://github.com/lionsoul2014/ip2region/tree/master/data) 下载 xdb 数据库文件。

## 快速开始

```typescript
import { Ip2Region } from 'ts-ip2region2';

// 创建查询器实例
const searcher = new Ip2Region('./data/ip2region_v4.xdb', {
  cachePolicy: 'vectorIndex', // file/vectorIndex/content
  ipVersion: 'v4', // v4/v6
});

// 查询IP地址
const result = searcher.search('120.229.45.2');
console.log(result);
// 输出: { region: '中国|0|江苏省|苏州市|电信', ioCount: 3, took: 1000 }

// 清理资源
searcher.close();
```

## API 参考

### 构造函数

```typescript
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

| 策略          | 内存占用 | 性能 | 使用场景       |
| ------------- | -------- | ---- | -------------- |
| `file`        | 最小     | 良好 | 内存受限环境   |
| `vectorIndex` | 中等     | 更好 | 一般使用(推荐) |
| `content`     | 较高     | 最佳 | 高并发场景     |

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
