const { Ip2Region } = require('.');
const path = require('path');

// 示例用法
async function example() {
  try {
    // IPv4 示例
    const ipv4DbPath = path.join(__dirname, './data/ip2region_v4.xdb');

    // 创建IPv4 searcher (使用vectorIndex缓存策略)
    const ipv4Searcher = new Ip2Region(ipv4DbPath, {
      cachePolicy: 'vectorIndex',
      ipVersion: 'v4',
    });

    // 查询IPv4地址
    console.log('IPv4 查询示例:');
    const ipv4Result = ipv4Searcher.search('120.229.45.2');
    console.log(`IP: 120.229.45.2`);
    console.log(`地区: ${ipv4Result.region}`);
    console.log(`IO次数: ${ipv4Result.ioCount}`);
    console.log(`耗时: ${ipv4Result.took} μs\n`);

    // 关闭IPv4 searcher
    ipv4Searcher.close();

    // IPv6 示例
    const ipv6DbPath = path.join(__dirname, './data/ip2region_v6.xdb');

    // 尝试IPv6 (跳过验证)
    try {
      // 创建IPv6 searcher
      const ipv6Searcher = new Ip2Region(ipv6DbPath, {
        cachePolicy: 'vectorIndex',
        ipVersion: 'v6',
      });

      // 查询IPv6地址
      console.log('IPv6 查询示例:');
      const ipv6Result = ipv6Searcher.search('2604:bc80:8001:11a4:ffff:ffff:ffff:ffff');
      console.log(`IP: 2604:bc80:8001:11a4:ffff:ffff:ffff:ffff`);
      console.log(`地区: ${ipv6Result.region}`);
      console.log(`IO次数: ${ipv6Result.ioCount}`);
      console.log(`耗时: ${ipv6Result.took} μs`);

      // 关闭IPv6 searcher
      ipv6Searcher.close();
    } catch (error) {
      console.log('IPv6 xdb文件不存在或无法使用:', error.message);
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

// 性能测试示例
function benchmarkExample() {
  try {
    const dbPath = path.join(__dirname, './data/ip2region_v4.xdb');

    const searcher = new Ip2Region(dbPath, {
      cachePolicy: 'content', // 使用content缓存获得最佳性能
    });

    const testIps = ['1.2.3.4', '8.8.8.8', '114.114.114.114', '120.229.45.2', '223.5.5.5'];

    console.log('\n性能测试:');
    const startTime = Date.now();

    for (let i = 0; i < 1000; i++) {
      const ip = testIps[i % testIps.length];
      searcher.search(ip);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`查询1000次耗时: ${totalTime}ms`);
    console.log(`平均每次查询: ${totalTime / 1000}ms`);

    searcher.close();
  } catch (error) {
    console.error('性能测试错误:', error.message);
  }
}

// 运行示例
if (require.main === module) {
  example().then(() => {
    benchmarkExample();
  });
}
