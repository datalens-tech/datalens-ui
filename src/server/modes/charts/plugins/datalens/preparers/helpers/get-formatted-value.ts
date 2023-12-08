import {
    ServerField,
    getFormatOptions,
    isDateField,
    isNumberField,
} from '../../../../../../../shared';
import {chartKitFormatNumberWrapper, formatDate} from '../../utils/misc-helpers';

export function getFormattedValue(field: ServerField, value: unknown) {
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
