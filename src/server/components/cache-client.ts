const Redis = require('ioredis');
Redis.Promise = require('bluebird');

export type RedisConfig = {
    redis?: {
        password: string;
        role: 'master' | 'slave';
        sentinels: {host: string; port: number}[];
        family: number;
        name: string;
    };
    appInstallation?: string;
};

export type CacheStatus =
    | typeof CacheClient.OK
    | typeof CacheClient.KEY_NOT_FOUND
    | typeof CacheClient.NOT_OK;
export type CacheClientResponse = {
    message?: string;
    status: CacheStatus;
    data?: any;
};

const REDIS_TIMEOUT = 2000;

export class CacheClient {
    static OK = Symbol('CACHE_STATUS_OK');
    static NOT_OK = Symbol('CACHE_STATUS_NOT_OK');
    static KEY_NOT_FOUND = Symbol('CACHE_STATUS_KEY_NOT_FOUND');

    _debug = false;
    client: typeof Redis | null = null;

    constructor({config}: {config: RedisConfig}) {
        this._debug = config.appInstallation === 'development';

        if (config.redis && config.redis.password) {
            this.client = new Redis(config.redis);
        }
    }

    async get({key}: {key: string}): Promise<CacheClientResponse> {
        if (this.client) {
            try {
                const data = await this.client.get(key).timeout(REDIS_TIMEOUT);
                if (data === null) {
                    return {
                        status: CacheClient.KEY_NOT_FOUND,
                    };
                }
                return {
                    status: CacheClient.OK,
                    data: JSON.parse(data),
                };
            } catch (error: any) {
                return {
                    status: CacheClient.NOT_OK,
                    message: error.message || 'Service unavailable',
                };
            }
        } else {
            return {
                status: CacheClient.NOT_OK,
                message: 'Redis client is null',
            };
        }
    }

    async set({
        key,
        value,
        ttl,
    }: {
        key: string;
        value: any;
        ttl?: number;
    }): Promise<CacheClientResponse> {
        if (this.client) {
            try {
                await this.client.set(key, JSON.stringify(value), 'EX', ttl).timeout(REDIS_TIMEOUT);
                return {
                    status: CacheClient.OK,
                };
            } catch (error: any) {
                return {
                    status: CacheClient.NOT_OK,
                    message: error.message || 'Service unavailable',
                };
            }
        } else {
            return {
                status: CacheClient.NOT_OK,
                message: 'Redis client is null',
            };
        }
    }

    async del({key}: {key: string}): Promise<CacheClientResponse> {
        if (this.client) {
            try {
                await this.client.del(key).timeout(REDIS_TIMEOUT);
                return {
                    status: CacheClient.OK,
                };
            } catch (error: any) {
                return {
                    status: CacheClient.NOT_OK,
                    message: error.message || 'Service unavailable',
                };
            }
        } else {
            return {
                status: CacheClient.NOT_OK,
                message: 'Redis client is null',
            };
        }
    }
}

export default CacheClient;
