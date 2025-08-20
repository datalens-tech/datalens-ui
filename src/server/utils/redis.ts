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

export type RedisConfigParams = {sentinels?: RedisSentinelsList; name?: string; envName?: string};

const getRedisDsnConfig = (params: RedisConfigParams = {}): RedisDsnConfig => {
    const envName = params.envName || 'REDIS_DSN_LIST';
    const redisDsnList = process.env[envName];

    if (!redisDsnList?.startsWith('redis://')) {
        return {
            name: params.name || '',
            sentinels: params.sentinels || [],
        };
    }

    const dsnListString = redisDsnList.slice('redis://'.length);

    const [namePasswordString, redisSentinelsString] = dsnListString.split('@');

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
