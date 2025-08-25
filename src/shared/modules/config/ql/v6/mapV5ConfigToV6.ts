import cloneDeep from 'lodash/cloneDeep';

import type {QlConfigV5} from '../../../../types/config/ql/v5';
import type {QlConfigV6} from '../../../../types/config/ql/v6';
import {QlConfigVersions} from '../../../../types/ql/versions';

function getNewPaltteId(value: string) {
    return value?.replace('-palette', '');
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
