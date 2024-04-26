import {omit} from 'lodash';

import {PlaceholderId, WizardVisualizationId} from '../../../../constants';
import {
    AxisMode,
    ChartsConfigVersion,
    ServerChartsConfig,
    V6ChartsConfig,
    V6Placeholder,
    V6Sort,
    V7ChartsConfig,
    V7Layer,
    V7Placeholder,
    isFieldHierarchy,
} from '../../../../types';
import {isVisualizationWithLayers} from '../../../../utils';
import {isMeasureField} from '../../../helpers';
import {isAllAxisModesAvailable, isPlaceholderSupportsAxisMode} from '../../../wizard-helpers';

const mapV6PlaceholdersToV7Placeholders = (
    visualizationId: WizardVisualizationId,
    placeholders: V6Placeholder[],
    sort: V6Sort[],
    sharedData: ServerChartsConfig['sharedData'] | undefined,
): V7Placeholder[] => {
    const sortHasMeasure = sort.some(isMeasureField);
    return placeholders.map((v6Placeholder): V7Placeholder => {
        const v6Settings = v6Placeholder.settings;

        if (
            isPlaceholderSupportsAxisMode(v6Placeholder.id as PlaceholderId, visualizationId) &&
            v6Settings?.axisMode
        ) {
            const firstField = v6Placeholder.items?.[0];

            if (!firstField) {
                return {
                    ...v6Placeholder,
                    settings: {
                        ...v6Settings,
                        axisModeMap: {},
                    },
                };
            }

            const fieldIsHierarchyByType = isFieldHierarchy(firstField);
            const fieldIsHierarchyByMeta =
                sharedData?.metaHierarchy &&
                sharedData.metaHierarchy[v6Placeholder.id] &&
                sharedData.metaHierarchy[v6Placeholder.id].hierarchyIndex === 0;

            const fieldIsHierarchy = fieldIsHierarchyByType || fieldIsHierarchyByMeta;

            if (fieldIsHierarchy) {
                if (firstField.fields && fieldIsHierarchyByType) {
                    const axisModeByHierarchyField = firstField.fields.reduce(
                        (acc, field) => {
                            const isContinuousMode =
                                isAllAxisModesAvailable(field) && !sortHasMeasure;

                            if (isContinuousMode) {
                                acc[field.guid] = AxisMode.Continuous;
                            } else {
                                acc[field.guid] = AxisMode.Discrete;
                            }

                            return acc;
                        },
                        {} as Record<string, AxisMode>,
                    );

                    return {
                        ...v6Placeholder,
                        settings: {
                            ...omit(v6Settings, 'axisMode'),
                            axisModeMap: axisModeByHierarchyField,
                        },
                    };
                } else {
                    const isContinuousMode = isAllAxisModesAvailable(firstField) && !sortHasMeasure;

                    return {
                        ...v6Placeholder,
                        settings: {
                            ...omit(v6Settings, 'axisMode'),
                            axisModeMap: {
                                [firstField.guid]: isContinuousMode
                                    ? AxisMode.Continuous
                                    : AxisMode.Discrete,
                            },
                        },
                    };
                }
            }

            return {
                ...v6Placeholder,
                settings: {
                    ...omit(v6Settings, 'axisMode'),
                    axisModeMap: {
                        [firstField.guid]: v6Settings.axisMode,
                    },
                },
            };
        }
        return {
            ...v6Placeholder,
            settings: {
                ...omit(v6Settings, 'axisMode'),
                axisModeMap: undefined,
            },
        };
    });
};

export const mapV6ConfigToV7 = (
    config: V6ChartsConfig,
    sharedData: ServerChartsConfig['sharedData'] | undefined,
): V7ChartsConfig => {
    let v7Visualization: V7ChartsConfig['visualization'];
    const sort = config.sort;

    if (isVisualizationWithLayers(config.visualization)) {
        v7Visualization = {
            ...config.visualization,
            layers: config.visualization.layers.map((layer): V7Layer => {
                return {
                    ...layer,
                    placeholders: mapV6PlaceholdersToV7Placeholders(
                        layer.id as WizardVisualizationId,
                        layer.placeholders,
                        sort,
                        sharedData,
                    ),
                };
            }),
        };
    } else {
        const placeholders = config.visualization.placeholders || [];

        v7Visualization = {
            ...config.visualization,
            layers: undefined,
            placeholders: mapV6PlaceholdersToV7Placeholders(
                config.visualization.id as WizardVisualizationId,
                placeholders,
                sort,
                sharedData,
            ),
        };
    }

    return {
        ...config,
        visualization: v7Visualization,
        version: ChartsConfigVersion.V7,
    };
};
