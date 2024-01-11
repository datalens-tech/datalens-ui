import {ConnectorType, DATALENS_QL_CONNECTION_TYPES} from '../../../../../../shared';

export const CONNECTOR_TYPE_TO_QL_CONNECTION_TYPE_MAP: Record<string, ConnectorType> = {
    [ConnectorType.Postgres]: DATALENS_QL_CONNECTION_TYPES.POSTGRESQL,
    [ConnectorType.Greenplum]: DATALENS_QL_CONNECTION_TYPES.POSTGRESQL,
    [ConnectorType.Clickhouse]: DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE,
    [ConnectorType.ChOverYt]: DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE,
    [ConnectorType.ChOverYtUserAuth]: DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE,
    [ConnectorType.Chydb]: DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE,
    [ConnectorType.ChFrozenDemo]: DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE,
    [ConnectorType.Chyt]: DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE,
    [ConnectorType.ChytNb]: DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE,
    [ConnectorType.Mssql]: DATALENS_QL_CONNECTION_TYPES.MSSQL,
    [ConnectorType.Mysql]: DATALENS_QL_CONNECTION_TYPES.MYSQL,
    [ConnectorType.Oracle]: DATALENS_QL_CONNECTION_TYPES.ORACLE,
    [ConnectorType.Ydb]: DATALENS_QL_CONNECTION_TYPES.YQL,
    [ConnectorType.Yq]: DATALENS_QL_CONNECTION_TYPES.YQL,
    [ConnectorType.Promql]: DATALENS_QL_CONNECTION_TYPES.PROMQL,
    [ConnectorType.Monitoring]: DATALENS_QL_CONNECTION_TYPES.MONITORING,
    [ConnectorType.MonitoringExt]: DATALENS_QL_CONNECTION_TYPES.MONITORING,
};

export function convertConnectionType(connectionType: string) {
    const mappedConnectionType = CONNECTOR_TYPE_TO_QL_CONNECTION_TYPE_MAP[connectionType];

    if (!mappedConnectionType) {
        throw new Error('Unsupported connection type');
    }

    return mappedConnectionType;
}
