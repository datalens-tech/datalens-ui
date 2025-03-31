import {PlaceholderId, WizardVisualizationId} from '../../../../constants';
import type {
    V10ChartsConfig,
    V10Placeholder,
    V9ChartsConfig,
    V9Placeholder,
} from '../../../../types';
import {ChartsConfigVersion} from '../../../../types';

export const mapV9ConfigToV10 = (config: V9ChartsConfig): V10ChartsConfig => {
    const affectedVisualizations = [
        WizardVisualizationId.Pie,
        WizardVisualizationId.Pie3D,
        WizardVisualizationId.Donut,
        WizardVisualizationId.PieD3,
        WizardVisualizationId.DonutD3,
    ];

    let visualization = config.visualization;

    if (affectedVisualizations.includes(visualization?.id as WizardVisualizationId)) {
        const placeholders = visualization.placeholders.map((p: V9Placeholder) => {
            if (p.id === PlaceholderId.Dimensions) {
                return {
                    ...p,
                    id: PlaceholderId.Colors,
                    type: PlaceholderId.Colors,
                    required: false,
                };
            }

            return p;
        });

        visualization = {
            ...visualization,
            placeholders: placeholders as V10Placeholder[],
        };
    }

    return {
        ...config,
        visualization,
        version: ChartsConfigVersion.V10,
    };
};
