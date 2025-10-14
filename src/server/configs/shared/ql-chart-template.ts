import type {Request} from '@gravity-ui/expresskit';

import type {ServerI18n} from '../../../i18n/types';
import type {QlExtendedConfig} from '../../../shared';
import {
    Feature,
    QL_TYPE,
    WizardVisualizationId,
    isGravityChartsVisualization,
    isMonitoringOrPrometheusChart,
} from '../../../shared';
import {mapQlConfigToLatestVersion} from '../../../shared/modules/config/ql';
import {getTranslationFn} from '../../../shared/modules/language';
import {identifyParams} from '../../modes/charts/plugins/ql/utils/identify-params';

export default {
    module: 'libs/qlchart/v1',
    identifyParams: (chart: QlExtendedConfig, req: Request) => {
        const i18nServer: ServerI18n = req.ctx.get('i18n');
        const getTranslation = getTranslationFn(i18nServer.getI18nServer());
        return identifyParams({chart, getTranslation});
    },
    identifyChartType: (chart: QlExtendedConfig, req: Request) => {
        const i18nServer: ServerI18n = req.ctx.get('i18n');

        const config = mapQlConfigToLatestVersion(chart, {
            i18n: getTranslationFn(i18nServer.getI18nServer()),
        });

        const {visualization, chartType} = config;
        const id = visualization.id;

        const {ctx} = req;
        const features = {
            GravityChartsForPieAndTreemap: ctx.get('isEnabledServerFeature')(
                Feature.GravityChartsForPieAndTreemap,
            ),
            GravityChartsForBarYAndScatter: ctx.get('isEnabledServerFeature')(
                Feature.GravityChartsForBarYAndScatter,
            ),
        };

        if (isGravityChartsVisualization({id, features})) {
            return QL_TYPE.D3_QL_NODE;
        }

        switch (id) {
            case 'table': // Legacy
            case WizardVisualizationId.FlatTable: // Available with WizardQLCommonVisualization feature
                return QL_TYPE.TABLE_QL_NODE;

            case WizardVisualizationId.Line:
            case WizardVisualizationId.Area:
            case WizardVisualizationId.Area100p:
            case WizardVisualizationId.Column:
            case WizardVisualizationId.Column100p:
                if (isMonitoringOrPrometheusChart(chartType)) {
                    return QL_TYPE.TIMESERIES_QL_NODE;
                } else {
                    return QL_TYPE.GRAPH_QL_NODE;
                }
            case WizardVisualizationId.Metric: {
                const {placeholders} = chart.visualization;

                let useMarkup;

                if (placeholders) {
                    const dataType = placeholders.find((p) => p.id === 'measures')?.items[0]
                        ?.data_type;

                    useMarkup = dataType === 'markup';
                } else {
                    // Case for legacy ql charts before integration with wizard
                    useMarkup = true;
                }

                if (useMarkup) {
                    return QL_TYPE.MARKUP_QL_NODE;
                } else {
                    return QL_TYPE.METRIC_QL_NODE;
                }
            }
            default:
                return QL_TYPE.GRAPH_QL_NODE;
        }
    },
    identifyLinks: (chart: QlExtendedConfig, req: Request) => {
        const i18nServer: ServerI18n = req.ctx.get('i18n');

        const config = mapQlConfigToLatestVersion(chart, {
            i18n: getTranslationFn(i18nServer.getI18nServer()),
        });
        return {
            connection: config.connection.entryId,
        };
    },
};
