import type {PlaceholderId, WizardVisualizationId} from '../../../../constants';
import type {
    ServerChartsConfig,
    V4ChartsConfig,
    V4Placeholder,
    V4Sort,
    V5ChartsConfig,
    V5Placeholder,
    V5Visualization,
} from '../../../../types';
import {AxisMode, ChartsConfigVersion, DATASET_FIELD_TYPES} from '../../../../types';
import {isVisualizationWithLayers} from '../../../../utils';
import {isMeasureField} from '../../../helpers';
import {isAllAxisModesAvailable, isPlaceholderSupportsAxisMode} from '../../../wizard-helpers';

const mapV4PlaceholderToV5Placeholder = ({
    placeholder,
    sharedData,
    sort,
    visualizationId,
}: {
    placeholder: V4Placeholder;
    sort: V4Sort[];
    visualizationId: string;
    sharedData: ServerChartsConfig['sharedData'] | undefined;
}): V5Placeholder => {
    const v5Placeholder: V5Placeholder = {...placeholder};
    const isPlaceholderWithAxisMode = isPlaceholderSupportsAxisMode(
        placeholder.id as PlaceholderId,
        visualizationId as WizardVisualizationId,
    );
    const sortHasMeasure = sort.some(isMeasureField);
    v5Placeholder.items = (placeholder.items || []).map((rawField, index) => {
        let field = rawField;

        if (
            field.data_type === DATASET_FIELD_TYPES.HIERARCHY &&
            field.fields &&
            sharedData?.metaHierarchy &&
            sharedData.metaHierarchy[v5Placeholder.id] &&
            sharedData.metaHierarchy[v5Placeholder.id].hierarchyIndex === index
        ) {
            const currentPlaceholderHierarchyMeta = sharedData.metaHierarchy[v5Placeholder.id];
            field = field.fields[currentPlaceholderHierarchyMeta.hierarchyFieldIndex];
        }

        if (field.dateMode) {
            if (
                isPlaceholderWithAxisMode &&
                // Axis mode always depends on first item in placeholder
                index === 0
            ) {
                v5Placeholder.settings = {
                    ...v5Placeholder.settings,
                    axisMode: sortHasMeasure ? AxisMode.Discrete : (field.dateMode as AxisMode),
                };
            }

            delete field.dateMode;
        }

        return field;
    });

    if (!v5Placeholder.settings?.axisMode && isPlaceholderWithAxisMode) {
        const firstPlaceholderItem = v5Placeholder.items[0];

        if (isAllAxisModesAvailable(firstPlaceholderItem) && !sortHasMeasure) {
            v5Placeholder.settings = {
                ...v5Placeholder.settings,
                axisMode: AxisMode.Continuous,
            };
        } else {
            v5Placeholder.settings = {
                ...v5Placeholder.settings,
                axisMode: AxisMode.Discrete,
            };
        }
    }

    return v5Placeholder;
};

export const mapV4ConfigToV5 = (
    config: V4ChartsConfig,
    sharedData: ServerChartsConfig['sharedData'] | undefined,
): V5ChartsConfig => {
    const v5Visualization: V5Visualization = {
        ...config.visualization,
    };

    if (isVisualizationWithLayers(config.visualization)) {
        v5Visualization.layers = (v5Visualization.layers || []).map((layer) => {
            return {
                ...layer,
                placeholders: layer.placeholders.map((placeholder) => {
                    return mapV4PlaceholderToV5Placeholder({
                        sharedData: sharedData,
                        placeholder,
                        sort: config.sort,
                        visualizationId: layer.id,
                    });
                }),
            };
        });
    } else if (config.visualization.placeholders) {
        v5Visualization.placeholders = config.visualization.placeholders.map((placeholder) =>
            mapV4PlaceholderToV5Placeholder({
                placeholder,
                sort: config.sort,
                visualizationId: config.visualization.id,
                sharedData,
            }),
        );
    }

    return {
        ...config,
        visualization: v5Visualization,
        version: ChartsConfigVersion.V5,
    };
};
