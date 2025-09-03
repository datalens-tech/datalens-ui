import type {Field, TableBarsSettings} from 'shared';
import {
    BarsAlignValues,
    BarsColorType,
    PlaceholderId,
    WizardVisualizationId,
    isMeasureType,
    isNumberField,
} from 'shared';
import {getTenantDefaultColorPaletteId} from 'ui/constants/common';

const PLACEHOLDERS_WITH_BARS_SETTINGS: Record<string, Record<string, boolean>> = {
    [WizardVisualizationId.FlatTable]: {
        [PlaceholderId.FlatTableColumns]: true,
    },
    [WizardVisualizationId.PivotTable]: {
        [PlaceholderId.Measures]: true,
    },
};

export const getDefaultBarsSettings = (): TableBarsSettings => ({
    enabled: false,
    colorSettings: {
        colorType: BarsColorType.TwoColor,
        settings: {
            palette: getTenantDefaultColorPaletteId(),
            positiveColorIndex: 2,
            negativeColorIndex: 1,
        },
    },
    showLabels: true,
    align: BarsAlignValues.Default,
    scale: {
        mode: 'auto',
    },
    showBarsInTotals: false,
});

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
