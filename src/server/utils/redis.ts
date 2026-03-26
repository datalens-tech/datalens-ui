export type RedisSentinel = {
    host: string;
    port: number;
};

export type RedisSentinelsList = Array<RedisSentinel>;

export type RedisTlsConfig = {
    ca?: string;
    cert?: string;
    key?: string;
};

export type RedisConfig = {
    sentinels?: RedisSentinelsList;
    name?: string;
    password?: string;
    host?: string;
    port?: number;
    tls?: RedisTlsConfig;
    family?: 4 | 6;
    role?: 'master' | 'slave';
};

export type RedisConfigParams = RedisConfig & {envName?: string};

export const getRedisConfig = (params: RedisConfigParams = {}): RedisConfig => {
    const envName = params.envName || 'REDIS_DSN_LIST';
    const redisDsnList = process.env[envName];
    const redisIpFamilyEnv = process.env.REDIS_IP_FAMILY;

    if (!redisDsnList?.match(/^rediss?:\/\//)) {
        return {
            name: params.name || '',
            sentinels: params.sentinels,
            host: params.host,
            port: params.port,
            family: params.family,
        };
    }

    const isTLS = redisDsnList.startsWith('rediss://');

    const dsnListString = redisDsnList.replace(/^rediss?:\/\//, '');

    const [namePasswordString, redisSentinelsString] = dsnListString.split('@');

    const [clusterName, password] = namePasswordString.includes(':')
        ? namePasswordString.split(':')
        : [undefined, namePasswordString];

    let redisIpFamily: 4 | 6 | undefined = 6;
    if (redisIpFamilyEnv === 'auto') {
        redisIpFamily = undefined;
    } else if (redisIpFamilyEnv === '4') {
        redisIpFamily = 4;
    } else if (redisIpFamilyEnv === '6') {
        redisIpFamily = 6;
    }

    const redisSentinels: Array<RedisSentinel> = redisSentinelsString
        .trim()
        .split(',')
        .map((hostPort) => {
            const [host, port] = hostPort.split(':');

            return {host: host.trim(), port: port ? parseInt(port, 10) : 26379};
        });

    if (redisSentinels.length < 2) {
        return {
            host: redisSentinels[0]?.host,
            port: redisSentinels[0]?.port,
            name: clusterName,
            password,
            family: redisIpFamily,
            tls: isTLS ? {} : undefined,
        };
    }

    return {
        sentinels: redisSentinels,
        name: clusterName,
        password,
        family: redisIpFamily,
        tls: isTLS ? {} : undefined,
        role: 'master',
    };
};
