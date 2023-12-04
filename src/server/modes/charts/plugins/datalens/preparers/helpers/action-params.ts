import {
    ServerField,
    StringParams,
    isDateField,
    isDimensionField,
} from '../../../../../../../shared';
import {formatDate, getServerDateFormat} from '../../utils/misc-helpers';

export function addActionParamValue(
    actionParams: StringParams,
    field: ServerField | undefined,
    value: unknown,
): StringParams {
    if (typeof value === 'undefined') {
        return actionParams;
    }

    if (field && isDimensionField(field)) {
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
