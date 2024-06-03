import type {ServerField, StringParams} from '../../../../../../../shared';
import {isDateField, isDimensionField, isMarkupField} from '../../../../../../../shared';
import {formatDate, getServerDateFormat} from '../../utils/misc-helpers';

export function canUseFieldForFiltering(field: ServerField) {
    return isDimensionField(field) && !isMarkupField(field);
}

export function addActionParamValue(
    actionParams: StringParams,
    field: ServerField | undefined,
    value: unknown,
): StringParams {
    if (typeof value === 'undefined') {
        return actionParams;
    }

    if (field && canUseFieldForFiltering(field)) {
        let paramValue = String(value);
        if (isDateField(field)) {
            paramValue = formatDate({
                valueType: field.data_type,
                value: value as number,
                format: getServerDateFormat(field.data_type),
            });
        }

        actionParams[field.guid] = paramValue;
    }

    return actionParams;
}
