import {ConnectorType} from 'shared/constants/connections';
import {QLChartType} from 'shared/constants/ql';

import ViewSetup from '../../../units/ql/containers/QL/ViewSetup/ViewSetup';
import {registry} from '../../index';

// Connection types available for QL charts
export const AVAILABLE_SQL_CONNECTION_TYPES = [
    ConnectorType.ChFrozenDemo,
    ConnectorType.ChOverYt,
    ConnectorType.ChOverYtUserAuth,
    ConnectorType.Chydb,
    ConnectorType.Clickhouse,
    ConnectorType.Greenplum,
    ConnectorType.Mssql,
    ConnectorType.Mysql,
    ConnectorType.Oracle,
    ConnectorType.Postgres,
    ConnectorType.Ydb,
    ConnectorType.Chyt,
];

export const AVAILABLE_PROMQL_CONNECTION_TYPES = ['promql'];

export const AVAILABLE_MONITORINGQL_CONNECTION_TYPES = ['solomon', 'monitoring'];

export const AVAILABLE_CONNECTION_TYPES_BY_CHART_TYPE = {
    [QLChartType.Sql]: AVAILABLE_SQL_CONNECTION_TYPES,
    [QLChartType.Promql]: AVAILABLE_PROMQL_CONNECTION_TYPES,
    [QLChartType.Monitoringql]: AVAILABLE_MONITORINGQL_CONNECTION_TYPES,
};

export const registerQlPlugins = () => {
    registry.ql.components.registerMany({
        QlUnconfiguredChartView: ViewSetup,
    });
    registry.ql.functions.register({
        getConnectionsByChartType: (chartType) => {
            return AVAILABLE_CONNECTION_TYPES_BY_CHART_TYPE[chartType];
        },
    });
};
