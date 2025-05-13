import {registry} from '../../../../../registry';

import type {JSTabOptions} from './js-v1.5-private';
import {fallbackJSFunctionPrivate} from './js-v1.5-private';

export const fallbackJSFunction = (...options: JSTabOptions) => {
    const {getAvailablePalettesMap} = registry.common.functions.getAll();
    const palettes = getAvailablePalettesMap();
    const features = registry.getApp().nodekit.ctx.get('getServerFeatures')();
    return fallbackJSFunctionPrivate({
        options,
        features,
        palettes,
    });
};
