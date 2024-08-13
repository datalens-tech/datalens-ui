import {ChartKitCustomError} from '../../ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

import {ALLOWED_REFERENCES} from './constants';

export function validateUrl(url: string, errorMsg?: string) {
    if (!ALLOWED_REFERENCES.some((ref) => String(url).startsWith(ref))) {
        const msg = errorMsg ?? `'${url}' is not valid url`;
        throw new ChartKitCustomError(undefined, {
            message: msg,
            details: msg,
        });
    }
}
