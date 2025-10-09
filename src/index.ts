const addon = require('../build/Release/ip2region.node');

export interface SearchResult {
    /** 地理位置信息字符串 */
    region: string;
    /** IO操作次数 */
    ioCount: number;
    /** 查询耗时(微秒) */
    took: number;
}

export interface Ip2RegionOptions {
    /** 缓存策略: 'file' | 'vectorIndex' | 'content' */
    cachePolicy?: 'file' | 'vectorIndex' | 'content';
    /** IP版本: 'v4' | 'v6' */
    ipVersion?: 'v4' | 'v6';
}

export interface VerifyResult {
    /** 验证结果 */
    valid: boolean;
    /** 错误代码 */
    errorCode: number;
}

export default class Ip2Region {
    private searcher: any;

    /**
     * 创建ip2region查询器实例
     * @param dbPath xdb数据库文件路径
     * @param options 配置选项
     */
    constructor(dbPath: string, options: Ip2RegionOptions = {}) {
        this.searcher = new addon.Ip2RegionSearcher(dbPath, options);
    }

    /**
     * 查询IP地址对应的地理位置信息
     * @param ip IP地址字符串(支持IPv4和IPv6)
     * @returns 查询结果
     */
    search(ip: string): SearchResult {
        return this.searcher.search(ip);
    }

    /**
     * 关闭查询器并释放资源
     */
    close(): void {
        this.searcher.close();
    }

    /**
     * 验证xdb文件的有效性
     * @param dbPath xdb文件路径
     * @returns 验证结果
     */
    static verify(dbPath: string): boolean {
        const result = addon.verifyXdb(dbPath);
        return result.valid;
    }

    /**
     * 验证xdb文件并返回详细信息
     * @param dbPath xdb文件路径
     * @returns 包含 valid 和 errorCode 的对象
     */
    static verifyDetailed(dbPath: string): VerifyResult {
        return addon.verifyXdb(dbPath);
    }
}

export { Ip2Region }