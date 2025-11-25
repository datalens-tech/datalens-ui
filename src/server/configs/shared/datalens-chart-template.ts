import type {Request} from '@gravity-ui/expresskit';

import type {ExtendedChartsConfig} from '../../../shared';
import {
    Feature,
    WizardType,
    WizardVisualizationId,
    getDatasetLinks,
    isGravityChartsVisualization,
    mapChartsConfigToLatestVersion,
} from '../../../shared';

export default {
    module: 'libs/datalens/v3',
    identifyParams: () => {
        return {};
    },
    identifyChartType: (chart: ExtendedChartsConfig, req: Request) => {
        const config = mapChartsConfigToLatestVersion(chart);
        let visualizationId;

        if (config.visualization?.id && /[a-zA-Z]+/.test(chart.visualization.id)) {
            visualizationId = config.visualization.id;
        } else {
            throw new Error('UNABLE_TO_IDENTIFY_CHART_TYPE');
        }

        const {ctx} = req;
        const isEnabledServerFeature = ctx.get('isEnabledServerFeature');
        const features = {
            GravityChartsForPieAndTreemap: isEnabledServerFeature(
                Feature.GravityChartsForPieAndTreemap,
            ),
            GravityChartsForBarYAndScatter: isEnabledServerFeature(
                Feature.GravityChartsForBarYAndScatter,
            ),
            GravityChartsForLineAreaAndBarX: isEnabledServerFeature(
                Feature.GravityChartsForLineAreaAndBarX,
            ),
        };

        if (
            isGravityChartsVisualization({id: visualizationId as WizardVisualizationId, features})
        ) {
            return WizardType.GravityChartsWizardNode;
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
                const {placeholders} = config.visualization;
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
