import {PlaceholderId, WizardVisualizationId} from '../../../../constants';
import {Placeholder} from '../../../../types';
import type {QlConfigV3} from '../../../../types/config/ql/v3';
import type {QlConfigV4} from '../../../../types/config/ql/v4';
import {QlConfigVersions} from '../../../../types/ql/versions';

export const mapV3ConfigToV4 = (config: QlConfigV3): QlConfigV4 => {
    const affectedVisualizations = [
        WizardVisualizationId.Pie,
        WizardVisualizationId.Donut,
        WizardVisualizationId.PieD3,
    ];

    let visualization = config.visualization;

    if (affectedVisualizations.includes(visualization?.id as WizardVisualizationId)) {
        let placeholders = visualization.placeholders;

        if (!visualization.placeholders.some((p) => p.id === PlaceholderId.Colors)) {
            const dimensionsPlaceholder = {
                id: PlaceholderId.Dimensions,
                type: PlaceholderId.Dimensions,
                items: [],
            };
            const colorsPlaceholder = {
                ...visualization.placeholders.find((p) => p.id === PlaceholderId.Dimensions),
                id: PlaceholderId.Colors,
                type: PlaceholderId.Colors,
                required: false,
            };
            const measuresPlaceholder = visualization.placeholders.find(
                (p) => p.id === PlaceholderId.Measures,
            );
            placeholders = [
                dimensionsPlaceholder,
                colorsPlaceholder,
                measuresPlaceholder,
            ] as Placeholder[];
        }

        visualization = {
            ...visualization,
            placeholders,
        };
    }

    return {
        ...config,
        visualization,
        version: QlConfigVersions.V4,
    };
};
