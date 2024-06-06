import {WizardVisualizationId} from '../../../../constants';
// import placeholderId this way because if it will be imported from constants
// it will be failed when playwright runs tests.
// the TypeError will occur and says that PlaceholderId is undefined
import {PlaceholderId} from '../../../../constants/placeholder';
import type {
    ServerField,
    V7ChartsConfig,
    V7Placeholder,
    V8ChartsConfig,
    V8Placeholder,
    V8Visualization,
} from '../../../../types';
import {ChartsConfigVersion} from '../../../../types';

const PLACEHOLDERS_WITH_TOTALS_SETTINGS: Record<string, boolean> = {
    [PlaceholderId.PivotTableRows]: true,
    [PlaceholderId.PivotTableColumns]: true,
};

const setGrandTotalsSettingToPlaceholderItems = (
    placeholder: V7Placeholder,
    isGrandTotalsEnabled: boolean,
): V8Placeholder => {
    const placeholderItems = placeholder.items || [];
    let updatedItems: ServerField[] = placeholderItems;

    if (placeholderItems.length) {
        updatedItems = [
            {...placeholderItems[0], subTotalsSettings: {enabled: isGrandTotalsEnabled}},
            ...placeholderItems.slice(1),
        ];
    }

    return {
        ...placeholder,
        items: updatedItems,
    };
};

export const mapV7ConfigToV8 = (config: V7ChartsConfig): V8ChartsConfig => {
    const visualization = config.visualization;
    const extraSettings = config.extraSettings;

    let updatedVisualization: V8Visualization;

    if (visualization.id === WizardVisualizationId.PivotTable) {
        const updatedPlaceholders: V8Placeholder[] = (visualization.placeholders || []).map(
            (placeholder) => {
                if (PLACEHOLDERS_WITH_TOTALS_SETTINGS[placeholder.id]) {
                    return setGrandTotalsSettingToPlaceholderItems(
                        placeholder,
                        extraSettings?.totals === 'on',
                    );
                }

                return placeholder;
            },
        );

        updatedVisualization = {
            ...visualization,
            placeholders: updatedPlaceholders,
        };
    } else {
        updatedVisualization = visualization;
    }

    return {
        ...config,
        visualization: updatedVisualization,
        version: ChartsConfigVersion.V8,
    };
};
