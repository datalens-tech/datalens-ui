import type {AppConfig} from '@gravity-ui/nodekit';
import Redis from 'ioredis';

export type RedisSentinel = {
    host: string;
    port: number;
};

export type RedisSentinelsList = Array<RedisSentinel>;

export type RedisDsnConfig = {
    sentinels: RedisSentinelsList;
    name: string;
    password?: string;
};

export type RedisConfig = RedisDsnConfig & {
    family: 4 | 6;
    role: 'master' | 'slave';
};

export type RedisConfigParams = {sentinels?: RedisSentinelsList; name?: string};

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

const timeout = <T>(prom: Promise<T>, time: number): Promise<T> => {
    let timer: NodeJS.Timeout;
    return Promise.race<T>([
        prom,
        new Promise((_r, rej) => {
            timer = setTimeout(rej, time, Error('TimeoutError'));
        }),
    ]).finally(() => clearTimeout(timer));
};

const getRedisDsnConfig = (params: RedisConfigParams = {}): RedisDsnConfig => {
    if (!process.env.REDIS_DSN_LIST?.startsWith('redis://')) {
        return {
            name: params.name || '',
            sentinels: params.sentinels || [],
        };
    }

    const dnsListString = process.env.REDIS_DSN_LIST.slice('redis://'.length);

    const [namePasswordString, redisSentinelsString] = dnsListString.split('@');

    const [name, password] = namePasswordString.split(':');

    const redisSentinels: Array<RedisSentinel> = redisSentinelsString
        .trim()
        .split(',')
        .map((hostPort) => {
            const [host, port] = hostPort.split(':');

            return {host: host.trim(), port: port ? parseInt(port, 10) : 26379};
        });

    return {
        sentinels: redisSentinels,
        name,
        password,
    };
};

export const getRedisConfig = (params: RedisConfigParams = {}): RedisConfig => {
    const dsnConfig = getRedisDsnConfig(params);

    return {
        sentinels: dsnConfig.sentinels,
        name: dsnConfig.name,
        family: 6,
        password: dsnConfig.password,
        role: 'master',
    };
};

export class CacheClient {
    static OK = Symbol('CACHE_STATUS_OK');
    static NOT_OK = Symbol('CACHE_STATUS_NOT_OK');
    static KEY_NOT_FOUND = Symbol('CACHE_STATUS_KEY_NOT_FOUND');

    _debug = false;
    client: Redis.Redis | null = null;

    constructor({config}: {config: AppConfig}) {
        this._debug = config.appInstallation === 'development';

        if (config.redis && config.redis.password) {
            this.client = new Redis(config.redis);
        }
    }

    async get({key}: {key: string}): Promise<CacheClientResponse> {
        if (this.client) {
            try {
                const data = await timeout(this.client.get(key), REDIS_TIMEOUT);
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
                await timeout(
                    this.client.set(key, JSON.stringify(value), 'EX', ttl),
                    REDIS_TIMEOUT,
                );
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
                await timeout(this.client.del(key), REDIS_TIMEOUT);
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
