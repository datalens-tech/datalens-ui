import {BarsAlignValues, BarsColorType} from 'shared/constants';
import type {TableBarsSettings} from 'shared/types/wizard';

export const getDefaultBarsSettings = (): TableBarsSettings => ({
    enabled: false,
    colorSettings: {
        colorType: BarsColorType.TwoColor,
        settings: {
            palette: undefined,
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
