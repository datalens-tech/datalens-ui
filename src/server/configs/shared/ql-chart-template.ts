import type {QLParam, StringParams} from '../../../shared';
import {QLChartType, QL_TYPE, isMonitoringOrPrometheusChart} from '../../../shared';

export default {
    module: 'libs/qlchart/v1',
    identifyParams: ({params, chartType}: {params: QLParam[]; chartType: QLChartType}) => {
        const availableParams: StringParams = {};

        if (params) {
            params.forEach((param) => {
                if (
                    param.type.includes('interval') &&
                    typeof param.defaultValue === 'object' &&
                    param.defaultValue !== null
                ) {
                    const fromName = `${param.name}_from`;
                    const toName = `${param.name}_to`;

                    availableParams[`${param.name}`] = '';
                    availableParams[fromName] = '';
                    availableParams[toName] = '';
                } else {
                    availableParams[param.name] = '';
                }
            });
        }

        if (chartType === QLChartType.Monitoringql) {
            availableParams['interval'] = '';
        }

        return availableParams;
    },
    identifyChartType: ({
        visualization: {id},
        chartType,
    }: {
        visualization: {id: string};
        chartType: QLChartType;
    }) => {
        switch (id) {
            case 'table': // Legacy
            case 'flatTable': // Available with WizardQLCommonVisualization feature
                return QL_TYPE.TABLE_QL_NODE;

            case 'line':
            case 'area':
            case 'area100p':
            case 'column':
            case 'column100p':
                if (isMonitoringOrPrometheusChart(chartType)) {
                    return QL_TYPE.TIMESERIES_QL_NODE;
                } else {
                    return QL_TYPE.GRAPH_QL_NODE;
                }
            case 'metric':
                return QL_TYPE.METRIC_QL_NODE;
            case 'scatter-d3':
            case 'bar-x-d3':
            case 'pie-d3': {
                return QL_TYPE.D3_QL_NODE;
            }
            default:
                return QL_TYPE.GRAPH_QL_NODE;
        }
    },
    identifyLinks: (chart: {connection: {entryId: string}}) => {
        return {
            connection: chart.connection.entryId,
        };
    },
};
