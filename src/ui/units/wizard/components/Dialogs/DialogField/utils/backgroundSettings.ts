import type {ColorsConfig, Field, TableFieldBackgroundSettings} from 'shared';
import {
    PlaceholderId,
    WizardVisualizationId,
    getFieldUISettings,
    isMeasureField,
    isMeasureName,
} from 'shared';
import {v1 as uuidv1} from 'uuid';

import type {GradientState, PaletteState} from '../../../../actions/dialogColor';
import {DEFAULT_GRADIENT_STATE, DEFAULT_PALETTE_STATE} from '../../../../constants/dialogColor';

export const extractPaletteSettings = (
    paletteState: PaletteState | ColorsConfig,
): TableFieldBackgroundSettings['settings']['paletteState'] => ({
    palette: paletteState.palette,
    mountedColors: paletteState.mountedColors,
});
export const extractGradientSettings = (
    gradientState: GradientState | ColorsConfig,
): TableFieldBackgroundSettings['settings']['gradientState'] => ({
    thresholdsMode: gradientState.thresholdsMode,
    leftThreshold: gradientState.leftThreshold,
    middleThreshold: gradientState.middleThreshold,
    rightThreshold: gradientState.rightThreshold,
    gradientPalette: gradientState.gradientPalette,
    gradientMode: gradientState.gradientMode,
    reversed: gradientState.reversed,
    nullMode: gradientState.nullMode,
});
export const getDefaultPaletteSettings = () => {
    return extractPaletteSettings(DEFAULT_PALETTE_STATE);
};

export const getDefaultGradientSettings = () => {
    return extractGradientSettings(DEFAULT_GRADIENT_STATE);
};

export const getDefaultBackgroundSettings = (field: Field): TableFieldBackgroundSettings => {
    const isContinuous = isMeasureField(field);

    const settings: TableFieldBackgroundSettings['settings'] = {
        gradientState: {},
        paletteState: {},
        isContinuous,
    };

    if (isContinuous) {
        settings.gradientState = getDefaultGradientSettings();
    } else {
        const fieldUISettings = getFieldUISettings({field});
        if (fieldUISettings?.colors) {
            settings.paletteState = {
                palette: fieldUISettings.palette,
                mountedColors: fieldUISettings.colors,
            };
        } else {
            settings.paletteState = getDefaultPaletteSettings();
        }
    }

    return {
        enabled: false,
        settingsId: uuidv1(),
        settings,
        colorFieldGuid: (isMeasureName(field) && field.title) || field.guid,
    };
};

export const PLACEHOLDERS_WITH_BACKGROUND_SETTINGS: Partial<Record<PlaceholderId, boolean>> = {
    [PlaceholderId.FlatTableColumns]: true,
    [PlaceholderId.Measures]: true,
    [PlaceholderId.PivotTableColumns]: true,
    [PlaceholderId.PivotTableRows]: true,
};
export const showBackgroundSettingsInDialogField = (
    visualizationId: WizardVisualizationId | undefined,
    placeholderId: PlaceholderId | undefined,
): boolean => {
    if (!placeholderId) {
        return false;
    }

    const isFlatTable = visualizationId === WizardVisualizationId.FlatTable;
    const isPivotTable = visualizationId === WizardVisualizationId.PivotTable;
    return Boolean(
        (isFlatTable || isPivotTable) && PLACEHOLDERS_WITH_BACKGROUND_SETTINGS[placeholderId],
    );
};
