import {
    ExtendedChartsConfig,
    Feature,
    WizardVisualizationId,
    isD3Visualization,
    isEnabledServerFeature,
    mapChartsConfigToLatestVersion,
} from '../../../shared';
import {registry} from '../../registry';

export default {
    module: 'libs/datalens/v3',
    identifyParams: () => {
        return {};
    },
    identifyChartType: (chart: ExtendedChartsConfig) => {
        let visualizationId;

        if (
            chart.visualization &&
            chart.visualization.id &&
            /[a-zA-Z]+/.test(chart.visualization.id)
        ) {
            visualizationId = chart.visualization.id;
        } else {
            throw new Error('UNABLE_TO_IDENTIFY_CHART_TYPE');
        }

        if (isD3Visualization(visualizationId as WizardVisualizationId)) {
            return 'd3_wizard_node';
        }

        switch (visualizationId) {
            case WizardVisualizationId.FlatTable:
            case WizardVisualizationId.PivotTable: {
                return 'table_wizard_node';
            }
            case WizardVisualizationId.Geolayer:
            case 'geopoint':
            case 'geopolygon':
            case 'heatmap': {
                return 'ymap_wizard_node';
            }
            case WizardVisualizationId.Metric: {
                const app = registry.getApp();

                const useMarkupMetric = isEnabledServerFeature(
                    app.nodekit.ctx,
                    Feature.MarkupMetric,
                );

                if (useMarkupMetric) {
                    return 'markup_wizard_node';
                } else {
                    return 'metric_wizard_node';
                }
            }
            default: {
                return 'graph_wizard_node';
            }
        }
    },
    identifyLinks: (chart: ExtendedChartsConfig) => {
        const links: Record<string, string> = {};
        const config = mapChartsConfigToLatestVersion(chart);
        const ids: string[] = config.datasetsIds;

        ids.forEach((id, i) => {
            const key = `dataset${i > 0 ? i : ''}`;

            links[key] = id;
        });

        return links;
    },
};
