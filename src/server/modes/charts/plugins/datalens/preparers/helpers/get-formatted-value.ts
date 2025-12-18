import type {ServerField} from '../../../../../../../shared';
import {getFormatOptions, isDateField, isNumberField} from '../../../../../../../shared';
import {chartKitFormatNumberWrapper, formatDate} from '../../utils/misc-helpers';

export function getFormattedValue(field: ServerField, value: unknown) {
    if (value === null) {
        return null;
    }

    if (isDateField(field)) {
        return formatDate({
            valueType: field.data_type,
            value: value as string,
            format: field.format,
        });
    }

    if (isNumberField(field)) {
        return chartKitFormatNumberWrapper(value as number, {
            lang: 'ru',
            ...getFormatOptions(field),
        });
    }

    return value;
}
