import {ChartKitCustomError} from '../../ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

import {ALLOWED_REFERENCES} from './constants';

export function validateUrl(url: string) {
    if (!ALLOWED_REFERENCES.some((ref) => String(url).startsWith(ref))) {
        const msg = `'${url}' is not valid url`;
        throw new ChartKitCustomError(msg, {
            details: msg,
        });
    }
}
