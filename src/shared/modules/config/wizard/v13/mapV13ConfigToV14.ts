import cloneDeep from 'lodash/cloneDeep';

import {ChartsConfigVersion} from '../../../../types';
import type {V13ChartsConfig} from '../../../../types/config/wizard/v13';
import type {V14ChartsConfig} from '../../../../types/config/wizard/v14';

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

export const mapV13ConfigToV14 = (config: V13ChartsConfig): V14ChartsConfig => {
    replacePalettesField(cloneDeep(config));

    return {
        ...config,
        version: ChartsConfigVersion.V14,
    };
};
