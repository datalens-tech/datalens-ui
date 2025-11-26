import type {Field} from 'shared';
import {PlaceholderId, WizardVisualizationId, isMeasureType, isNumberField} from 'shared';

const PLACEHOLDERS_WITH_BARS_SETTINGS: Record<string, Record<string, boolean>> = {
    [WizardVisualizationId.FlatTable]: {
        [PlaceholderId.FlatTableColumns]: true,
    },
    [WizardVisualizationId.PivotTable]: {
        [PlaceholderId.Measures]: true,
    },
};

export const showBarsInDialogField = (
    visualizationId: string | undefined,
    placeholderId: PlaceholderId | undefined,
    field?: Field,
): boolean => {
    if (!visualizationId || !placeholderId) {
        return false;
    }
    const placeholders = PLACEHOLDERS_WITH_BARS_SETTINGS[visualizationId];
    const isSupportedPlaceholder = placeholders?.[placeholderId];

    return Boolean(isSupportedPlaceholder && isNumberField(field) && isMeasureType(field));
};
