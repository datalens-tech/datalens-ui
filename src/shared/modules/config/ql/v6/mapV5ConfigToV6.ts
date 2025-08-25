import cloneDeep from 'lodash/cloneDeep';

import {COMMON_PALETTE_ID} from '../../../../constants';
import type {QlConfigV5} from '../../../../types/config/ql/v5';
import type {QlConfigV6} from '../../../../types/config/ql/v6';
import {QlConfigVersions} from '../../../../types/ql/versions';

function getNewPaltteId(value: string) {
    switch (value) {
        case 'classic20-palette': {
            return COMMON_PALETTE_ID.CLASSIC_20;
        }
        case 'default20-palette': {
            return COMMON_PALETTE_ID.DEFAULT_20;
        }
        default:
            return value;
    }
}

function replacePalettesField(item: unknown) {
    if (item && typeof item === 'object') {
        if ('metricFontColorPalette' in item) {
            item.metricFontColorPalette = getNewPaltteId(item.metricFontColorPalette as string);
        } else if ('palette' in item) {
            item.palette = getNewPaltteId(item.palette as string);
        } else {
            Object.values(item).forEach(replacePalettesField);
        }
    }
}

export const mapV5ConfigToV6 = (config: QlConfigV5): QlConfigV6 => {
    replacePalettesField(cloneDeep(config));

    return {
        ...config,
        version: QlConfigVersions.V6,
    };
};
