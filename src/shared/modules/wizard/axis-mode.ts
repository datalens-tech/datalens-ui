import type {WizardVisualizationId} from '../../constants';
import {PlaceholderId} from '../../constants';
import type {ServerChartsConfig, ServerSort, V11Color, V11Placeholder, V11Shape} from '../../types';
import {AxisMode} from '../../types';
import {isMeasureField} from '../helpers';
import {isContinuousAxisModeDisabled} from '../wizard-helpers';

export function getXAxisMode(args: {config: Partial<ServerChartsConfig>}): AxisMode | undefined {
    const {config} = args;
    const layers = config.visualization?.layers ?? [];

    const getVisualizationAxisMode = (visualization: {
        shapes: V11Shape[];
        placeholders: V11Placeholder[];
        id: WizardVisualizationId;
        colors: V11Color[];
    }) => {
        const {id, placeholders, colors, shapes} = visualization;
        const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
        const xField = xPlaceholder?.items[0];
        const axisSettings = xPlaceholder?.settings?.axisModeMap?.[xField?.guid];
        let sort: ServerSort[] = [];

        // There is a grouping of data - continuous axis can be used
        // (sorting will be applied to all other dimensions except x)
        if (colors?.some(isMeasureField) || shapes?.some(isMeasureField)) {
            sort = [];
        } else {
            sort = config.sort ?? [];
        }

        if (!xField) {
            return undefined;
        }

        const isContinuousModeRestricted = isContinuousAxisModeDisabled({
            field: xField,
            axisSettings,
            visualizationId: id,
            sort,
        });

        if (isContinuousModeRestricted) {
            return AxisMode.Discrete;
        }

        return axisSettings ?? AxisMode.Continuous;
    };

    if (layers.length) {
        return layers.reduce<AxisMode | undefined>((resultAxisMode, layer) => {
            if (resultAxisMode !== AxisMode.Discrete) {
                const layerAxisMode = getVisualizationAxisMode({
                    id: layer.id as WizardVisualizationId,
                    shapes: layer.commonPlaceholders.shapes ?? [],
                    colors: layer.commonPlaceholders.colors ?? [],
                    placeholders: layer.placeholders,
                });

                return layerAxisMode ?? resultAxisMode;
            }

            return resultAxisMode;
        }, undefined);
    }

    const visualization = config.visualization;
    return getVisualizationAxisMode({
        id: visualization?.id as WizardVisualizationId,
        shapes: config.shapes ?? [],
        colors: config.colors ?? [],
        placeholders: visualization?.placeholders ?? [],
    });
}
