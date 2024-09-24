import {PlaceholderId, WizardVisualizationId} from '../../constants';
import type {ServerChartsConfig, ServerSort, V11Color, V11Placeholder, V11Shape} from '../../types';
import {AxisMode} from '../../types';
import {isMeasureField} from '../helpers';
import {isContinuousAxisModeDisabled} from '../wizard-helpers';

const Y_AS_MAIN_AXIS: WizardVisualizationId[] = [
    WizardVisualizationId.Bar,
    WizardVisualizationId.Bar100p,
];

export function getXAxisMode(args: {config: Partial<ServerChartsConfig>}): AxisMode {
    const {config} = args;
    const layers = config.visualization?.layers ?? [];

    const getVisualizationAxisMode = (visualization: {
        shapes: V11Shape[];
        placeholders: V11Placeholder[];
        id: WizardVisualizationId;
        colors: V11Color[];
    }) => {
        const {placeholders, colors, shapes} = visualization;
        const visualizationId = visualization.id as WizardVisualizationId;
        // Historically, x for a bar chart is y
        const xPlaceholder = placeholders.find((p) => {
            return Y_AS_MAIN_AXIS.includes(visualizationId)
                ? p.id === PlaceholderId.Y
                : p.id === PlaceholderId.X;
        });
        const xField = xPlaceholder?.items[0];
        const axisSettings = xPlaceholder?.settings;
        let sort: ServerSort[] = [];

        // There is a grouping of data - continuous axis can be used
        // (sorting will be applied to all other dimensions except x)
        if (colors?.some(isMeasureField) || shapes?.some(isMeasureField)) {
            sort = [];
        } else {
            sort = config.sort ?? [];
        }

        if (!xField) {
            return AxisMode.Discrete;
        }

        const isContinuousModeRestricted = isContinuousAxisModeDisabled({
            field: xField,
            axisSettings,
            visualizationId,
            sort,
        });

        if (isContinuousModeRestricted) {
            return AxisMode.Discrete;
        }

        return axisSettings?.axisModeMap?.[xField.guid] ?? AxisMode.Continuous;
    };

    if (layers.length) {
        return (
            layers.reduce<AxisMode | undefined>((res, layer) => {
                if (res !== AxisMode.Discrete) {
                    const layerAxisMode = getVisualizationAxisMode({
                        id: layer.id as WizardVisualizationId,
                        shapes: layer.commonPlaceholders.shapes ?? [],
                        colors: layer.commonPlaceholders.colors ?? [],
                        placeholders: layer.placeholders,
                    });

                    return layerAxisMode ?? res;
                }

                return res;
            }, undefined) ?? AxisMode.Discrete
        );
    }

    const visualization = config.visualization;
    return getVisualizationAxisMode({
        id: visualization?.id as WizardVisualizationId,
        shapes: config.shapes ?? [],
        colors: config.colors ?? [],
        placeholders: visualization?.placeholders ?? [],
    });
}
