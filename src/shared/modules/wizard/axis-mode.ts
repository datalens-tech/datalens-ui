import {PlaceholderId, WizardVisualizationId} from '../../constants';
import type {ServerChartsConfig, ServerField, ServerPlaceholder, ServerSort} from '../../types';
import {AxisMode} from '../../types';
import {isMeasureField} from '../helpers';
import {isContinuousAxisModeDisabled} from '../wizard-helpers';

const Y_AS_MAIN_AXIS: WizardVisualizationId[] = [
    WizardVisualizationId.Bar,
    WizardVisualizationId.Bar100p,
    WizardVisualizationId.BarYD3,
    WizardVisualizationId.BarY100pD3,
];

type GetXAxisModeArgs = {
    config: Partial<ServerChartsConfig>;
    /* new field in the placeholder (not yet in the config) */
    xField?: ServerField;
};

function getXPlaceholder(args: {id: WizardVisualizationId; placeholders: ServerPlaceholder[]}) {
    const {id, placeholders} = args;
    // Historically, x for a bar chart is y
    return placeholders.find((p) => {
        return Y_AS_MAIN_AXIS.includes(id) ? p.id === PlaceholderId.Y : p.id === PlaceholderId.X;
    });
}

export function getXAxisMode(args: GetXAxisModeArgs): AxisMode {
    const {config, xField: newXField} = args;
    const layers = config.visualization?.layers ?? [];

    const getVisualizationAxisMode = (visualization: {
        placeholders: ServerPlaceholder[];
        id: WizardVisualizationId;
        xField?: ServerField;
        sort?: ServerSort[];
    }) => {
        const {placeholders, xField, sort = []} = visualization;
        const visualizationId = visualization.id as WizardVisualizationId;
        const xPlaceholder = getXPlaceholder({placeholders, id: visualizationId});
        const field = xField ?? xPlaceholder?.items[0];
        const axisSettings = xPlaceholder?.settings;

        if (!field) {
            return AxisMode.Discrete;
        }

        const isContinuousModeRestricted = isContinuousAxisModeDisabled({
            field,
            axisSettings,
            visualizationId,
            sort,
        });

        if (isContinuousModeRestricted) {
            return AxisMode.Discrete;
        }

        return axisSettings?.axisModeMap?.[field.guid] ?? AxisMode.Continuous;
    };

    if (layers.length) {
        const selectedLayerId = config.visualization?.selectedLayerId;
        let xField: ServerField | undefined = newXField;

        if (!xField) {
            const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? layers[0];
            const xPlaceholder = getXPlaceholder({
                placeholders: selectedLayer.placeholders ?? [],
                id: selectedLayer.id as WizardVisualizationId,
            });
            xField = xPlaceholder?.items[0];
        }

        return (
            layers.reduce<AxisMode | undefined>((res, layer) => {
                if (res !== AxisMode.Discrete) {
                    const layerAxisMode = getVisualizationAxisMode({
                        id: layer.id as WizardVisualizationId,
                        placeholders: layer.placeholders,
                        xField,
                        sort: hasSortThanAffectAxisMode(config)
                            ? layer.commonPlaceholders.sort
                            : [],
                    });

                    return layerAxisMode ?? res;
                }

                return res;
            }, undefined) ?? AxisMode.Continuous
        );
    }

    const visualization = config.visualization;
    return getVisualizationAxisMode({
        id: visualization?.id as WizardVisualizationId,
        placeholders: visualization?.placeholders ?? [],
        xField: newXField,
        sort: hasSortThanAffectAxisMode(config) ? config.sort : [],
    });
}

export function hasSortThanAffectAxisMode(config: Partial<ServerChartsConfig>) {
    if (config.visualization?.layers) {
        return config.visualization.layers.some((layer) => {
            const {colors = [], shapes = [], sort = []} = layer.commonPlaceholders || {};
            return sort.length && ![...colors, ...shapes].some((field) => !isMeasureField(field));
        });
    }

    const {colors = [], shapes = [], sort = []} = config || {};
    // There is a grouping of data - continuous axis can be used
    // (sorting will be applied to all other dimensions except x)
    return sort.length && ![...colors, ...shapes].some((field) => !isMeasureField(field));
}
