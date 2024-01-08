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
    identifyChartType: (chart: {visualization: {id: string}}) => {
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
            case 'flatTable':
            case 'pivotTable': {
                return 'table_wizard_node';
            }
            case 'geolayer':
            case 'geopoint':
            case 'geopolygon':
            case 'heatmap': {
                return 'ymap_wizard_node';
            }
            case 'metric': {
                return 'metric_wizard_node';
            }
            default: {
                return 'graph_wizard_node';
            }
        }
    },
    identifyLinks: (chart: ExtendedChartsConfig) => {
        const app = registry.getApp();
        const links: Record<string, string> = {};

        const shouldMigrateDatetime = Boolean(
            isEnabledServerFeature(app.nodekit.ctx, Feature.GenericDatetimeMigration),
        );

        const config = mapChartsConfigToLatestVersion(chart, {shouldMigrateDatetime});

        const ids: string[] = config.datasetsIds;

        ids.forEach((id, i) => {
            const key = `dataset${i > 0 ? i : ''}`;

            links[key] = id;
        });

        return links;
    },
};
