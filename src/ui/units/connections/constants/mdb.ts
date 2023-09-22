import {ConnectorType, type MdbAvailableDatabase} from 'shared';

export const MDB_SERVICES: Record<MdbAvailableDatabase, string> = {
    [ConnectorType.Clickhouse]: 'managed-clickhouse',
    [ConnectorType.Greenplum]: 'managed-greenplum',
    [ConnectorType.Mysql]: 'managed-mysql',
    [ConnectorType.Postgres]: 'managed-postgresql',
};
