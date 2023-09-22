import {formatNumber} from 'shared/modules/format-units/formatUnit';
import type {FormatNumberOptions} from 'shared/modules/format-units/types';

export const numberFormat = (val: number, round?: number, options: FormatNumberOptions = {}) => {
    if (parseInt(val as unknown as string, 10) === val) {
        if (typeof round === 'number') {
            return formatNumber(val, {
                precision: Math.min(round, 20),
                ...options,
            });
        } else {
            return formatNumber(val, {
                precision: 0,
                ...options,
            });
        }
    } else if (val) {
        let resultRound = round;

        if (typeof resultRound !== 'number') {
            resultRound = val.toString().split('.')[1].length;
        }

        return formatNumber(val, {
            precision: Math.min(resultRound, 20),
            ...options,
        });
    }

    return null;
};
