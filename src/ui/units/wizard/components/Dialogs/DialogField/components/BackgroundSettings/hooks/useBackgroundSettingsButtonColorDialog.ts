import React from 'react';

import type {ColorsConfig, NestedPartial, TableFieldBackgroundSettings} from 'shared';

import {PaletteType} from '../../../../../../../../components/PaletteIcon/PaletteIcon';
import {extractGradientSettings, extractPaletteSettings} from '../../../utils/backgroundSettings';

type UseBackgroundSettingsButtonColorDialogArgs = {
    state: TableFieldBackgroundSettings;
    onUpdate: (backgroundSettings: NestedPartial<TableFieldBackgroundSettings, 'settings'>) => void;
};

export const useBackgroundSettingsButtonColorDialog = (
    args: UseBackgroundSettingsButtonColorDialogArgs,
) => {
    const {onUpdate, state} = args;

    const handleDialogColorApply = React.useCallback(
        (colorsConfig: ColorsConfig) => {
            const isContinuous = state.settings.isContinuous;
            const settings: Partial<TableFieldBackgroundSettings['settings']> = {
                gradientState: {},
                paletteState: {},
            };

            if (isContinuous) {
                settings.gradientState = extractGradientSettings(colorsConfig);
            } else {
                settings.paletteState = extractPaletteSettings(colorsConfig);
            }

            onUpdate({settings});
        },
        [onUpdate, state.settings.isContinuous],
    );

    const paletteId = (
        state.settings.isContinuous
            ? state.settings.gradientState.gradientPalette
            : state.settings.paletteState.palette
    ) as string;

    const paletteType = state.settings.isContinuous
        ? PaletteType.GradientPalette
        : PaletteType.ColorPalette;

    const colorsConfig = {...state.settings.paletteState, ...state.settings.gradientState};

    return {handleDialogColorApply, paletteId, paletteType, colorsConfig};
};
