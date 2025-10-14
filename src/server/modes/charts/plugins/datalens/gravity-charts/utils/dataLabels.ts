import type {ServerField} from '../../../../../../../shared';
import {getFormatOptions, isNumberField} from '../../../../../../../shared';
import {chartKitFormatNumberWrapper} from '../../utils/misc-helpers';

export function getFormattedLabel(value?: string | number, labelField?: ServerField) {
    if (!labelField || typeof value === 'undefined') {
        return undefined;
    }

    if (isNumberField(labelField)) {
        return chartKitFormatNumberWrapper(value, {
            lang: 'ru',
            ...getFormatOptions(labelField),
        });
    }

    return String(value);
}
