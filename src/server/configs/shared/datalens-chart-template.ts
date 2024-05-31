import {
    ExtendedChartsConfig,
    WizardVisualizationId,
    getDatasetLinks,
    isD3Visualization,
    mapChartsConfigToLatestVersion,
} from '../../../shared';

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
                const {placeholders} = chart.visualization;
                // @ts-ignore will be removed after migration to v5
                const dataType = placeholders.find((p) => p.id === 'measures')?.items[0]?.data_type;
                const useMarkup = dataType === 'markup';

                if (useMarkup) {
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
        const config = mapChartsConfigToLatestVersion(chart);
        return getDatasetLinks(config);
    },
};
