const addon = require('../build/Release/ip2region.node');
import { getDataPaths, isDataExtracted } from 'ts-ip2region2-data';

export interface SearchResult {
    /** Geographic location information string */
    region: string;
    /** Number of IO operations */
    ioCount: number;
    /** Query time in microseconds */
    took: number;
}

export interface Ip2RegionOptions {
    /** Cache strategy: 'file' | 'vectorIndex' | 'content' */
    cachePolicy?: 'file' | 'vectorIndex' | 'content';
    /** IP version: 'v4' | 'v6' */
    ipVersion?: 'v4' | 'v6';
}

export interface VerifyResult {
    /** Verification result */
    valid: boolean;
    /** Error code */
    errorCode: number;
}

export default class Ip2Region {
    private searcher: any;
    private readonly dbPath: string;
    private readonly options: Required<Ip2RegionOptions>;

    /**
     * Create ip2region searcher instance
     * @param dbPath Path to xdb database file (optional, will use bundled data if not provided)
     * @param options Configuration options
     */
    constructor(dbPath?: string, options: Ip2RegionOptions = {}) {
        this.options = {
            cachePolicy: options.cachePolicy || 'vectorIndex',
            ipVersion: options.ipVersion || 'v4',
        };
        
        if (!dbPath) {
            if (!isDataExtracted()) {
                throw new Error('Bundled data not found. Please ensure ts-ip2region2-data is properly installed.');
            }
            const dataPaths = getDataPaths();
            this.dbPath = this.options.ipVersion === 'v6' ? dataPaths.v6 : dataPaths.v4;
        } else {
            if (typeof dbPath !== 'string') {
                throw new TypeError('Database path must be a string');
            }
            this.dbPath = dbPath;
        }
        
        this.searcher = new addon.Ip2RegionSearcher(this.dbPath, this.options);
    }

    /**
     * Query geographic location information for IP address
     * @param ip IP address string (supports IPv4 and IPv6)
     * @returns Query result
     */
    search(ip: string): SearchResult {
        if (!ip || typeof ip !== 'string') {
            throw new TypeError('IP address must be a non-empty string');
        }
        return this.searcher.search(ip);
    }

    /**
     * Close searcher and release resources
     */
    close(): void {
        this.searcher.close();
    }

    /**
     * Verify the validity of xdb file
     * @param dbPath Path to xdb file
     * @returns Verification result
     */
    static verify(dbPath: string): boolean {
        if (!dbPath || typeof dbPath !== 'string') {
            throw new TypeError('Database path must be a non-empty string');
        }
        const result = addon.verifyXdb(dbPath);
        return result.valid;
    }

    /**
     * Verify xdb file and return detailed information
     * @param dbPath Path to xdb file
     * @returns Object containing valid and errorCode
     */
    static verifyDetailed(dbPath: string): VerifyResult {
        if (!dbPath || typeof dbPath !== 'string') {
            throw new TypeError('Database path must be a non-empty string');
        }
        return addon.verifyXdb(dbPath);
    }

    /**
     * Get current configuration
     * @returns Current options
     */
    getOptions(): Required<Ip2RegionOptions> {
        return { ...this.options };
    }

    /**
     * Get database file path
     * @returns Database path
     */
    getDbPath(): string {
        return this.dbPath;
    }
}

export { Ip2Region }