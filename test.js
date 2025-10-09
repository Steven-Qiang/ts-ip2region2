const { Ip2Region } = require('.');
const path = require('path');

function runTests() {
  console.log('开始测试 ip2region Node.js addon...\n');

  // 测试1: 验证xdb文件
  console.log('测试1: 验证xdb文件');
  const ipv4DbPath = path.join(__dirname, './data/ip2region_v4.xdb');

  const verifyResult = Ip2Region.verifyDetailed(ipv4DbPath);
  console.log(`IPv4 xdb文件验证: ${verifyResult.valid ? '通过' : '失败'}`);
  console.log(`错误代码: ${verifyResult.errorCode}\n`);

  if (!verifyResult.valid) {
    console.log('请确保xdb文件存在于正确路径');
    return;
  }

  // 测试2: 基本查询功能
  console.log('测试2: 基本查询功能');
  try {
    const searcher = new Ip2Region(ipv4DbPath, {
      cachePolicy: 'vectorIndex',
      ipVersion: 'v4',
    });

    const testIps = ['1.2.3.4', '8.8.8.8', '114.114.114.114', '120.229.45.2'];

    testIps.forEach((ip) => {
      const result = searcher.search(ip);
      console.log(`IP: ${ip} -> ${result.region} (${result.took}μs, IO:${result.ioCount})`);
    });

    searcher.close();
    console.log('基本查询测试通过\n');
  } catch (error) {
    console.error('基本查询测试失败:', error.message);
    return;
  }

  // 测试3: 不同缓存策略
  console.log('测试3: 不同缓存策略性能对比');
  const policies = ['file', 'vectorIndex', 'content'];
  const testIp = '120.229.45.2';

  policies.forEach((policy) => {
    try {
      const searcher = new Ip2Region(ipv4DbPath, {
        cachePolicy: policy,
        ipVersion: 'v4',
      });

      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        searcher.search(testIp);
      }
      const endTime = Date.now();

      console.log(`${policy} 模式: 100次查询耗时 ${endTime - startTime}ms`);
      searcher.close();
    } catch (error) {
      console.error(`${policy} 模式测试失败:`, error.message);
    }
  });

  console.log('\n所有测试完成！');
}

// 错误处理测试
function testErrorHandling() {
  console.log('\n测试4: 错误处理');

  try {
    // 测试无效文件路径
    const searcher = new Ip2Region('./invalid_path.xdb');
    console.log('错误: 应该抛出异常');
  } catch (error) {
    console.log('无效文件路径处理: 通过');
  }

  try {
    const searcher = new Ip2Region(path.join(__dirname, './data/ip2region_v4.xdb'));

    // 测试无效IP地址
    const result = searcher.search('invalid.ip.address');
    console.log('错误: 应该抛出异常');
    searcher.close();
  } catch (error) {
    console.log('无效IP地址处理: 通过');
  }
}

if (require.main === module) {
  runTests();
  testErrorHandling();
}
