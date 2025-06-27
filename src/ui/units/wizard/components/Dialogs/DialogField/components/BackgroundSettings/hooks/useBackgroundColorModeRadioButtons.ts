import React from 'react';

import type {SegmentedRadioGroupOptionProps} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import type {Field, NestedPartial, TableFieldBackgroundSettings} from 'shared';
import {
    PlaceholderId,
    WizardVisualizationId,
    isDimensionField,
    isMeasureField,
    isMeasureName,
    isNumberField,
} from 'shared';

import {
    getDefaultGradientSettings,
    getDefaultPaletteSettings,
} from '../../../utils/backgroundSettings';

type UseBackgroundSettingsModeArgs = {
    onUpdate: (args: NestedPartial<TableFieldBackgroundSettings, 'settings'>) => void;
    state: TableFieldBackgroundSettings;
    field: Field;
    placeholderId: PlaceholderId;
    visualizationId: WizardVisualizationId;
};

type UseBackgroundSettingsMode = {
    radioButtonOptions: SegmentedRadioGroupOptionProps[];
    selectedRadioButton: string | undefined;
    handleModeRadioButtonsUpdate: (mode: string) => void;
};

export const enum BackgroundColorMode {
    Palette = 'palette',
    Gradient = 'gradient',
}

const BACKGROUND_COLOR_MODE_RADIO_BUTTONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: BackgroundColorMode.Palette,
        content: i18n('wizard', 'label_palette'),
    },
    {
        value: BackgroundColorMode.Gradient,
        content: i18n('wizard', 'label_gradient'),
    },
];

const getSelectedRadioButton = (state: TableFieldBackgroundSettings) => {
    return state.settings.isContinuous ? BackgroundColorMode.Gradient : BackgroundColorMode.Palette;
};

export const useBackgroundColorModeRadioButtons = ({
    onUpdate,
    state,
    field,
    placeholderId,
    visualizationId,
}: UseBackgroundSettingsModeArgs): UseBackgroundSettingsMode => {
    const isPlaceholderWithPaletteOnlyMode =
        visualizationId === WizardVisualizationId.PivotTable &&
        (placeholderId === PlaceholderId.PivotTableColumns ||
            placeholderId === PlaceholderId.PivotTableRows);
    const radioButtonOptions = React.useMemo(() => {
        return BACKGROUND_COLOR_MODE_RADIO_BUTTONS.map((options) => {
            switch (options.value as BackgroundColorMode) {
                case BackgroundColorMode.Palette: {
                    return {
                        ...options,
                        disabled: isMeasureField(field),
                    };
                }
                case BackgroundColorMode.Gradient: {
                    return {
                        ...options,
                        disabled:
                            (isDimensionField(field) && !isNumberField(field)) ||
                            isMeasureName(field) ||
                            isPlaceholderWithPaletteOnlyMode,
                    };
                }
                default:
                    return options;
            }
        });
    }, [field, isPlaceholderWithPaletteOnlyMode]);
    const selectedRadioButton: string | undefined = getSelectedRadioButton(state);

    const handleModeRadioButtonsUpdate = React.useCallback(
        (mode: string) => {
            const isContinuous = mode === BackgroundColorMode.Gradient;
            const settings: TableFieldBackgroundSettings['settings'] = {
                isContinuous,
                gradientState: {},
                paletteState: {},
            };

            if (isContinuous) {
                settings.gradientState = getDefaultGradientSettings();
            } else {
                settings.paletteState = getDefaultPaletteSettings();
            }

            onUpdate({
                settings,
            });
        },
        [onUpdate],
    );

    return {
        radioButtonOptions,
        selectedRadioButton,
        handleModeRadioButtonsUpdate,
    };
};
