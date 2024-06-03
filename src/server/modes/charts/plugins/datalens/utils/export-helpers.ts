import type {ExportingColumnOptions, ServerField} from '../../../../../../shared';
import {getFakeTitleOrTitle, isDateField} from '../../../../../../shared';

import {getDefaultDateFormat} from './misc-helpers';

export function getFieldsExportingOptions(fields: Record<string, ServerField | undefined>) {
    const result: Record<string, ExportingColumnOptions> = {};

    return Object.keys(fields).reduce((res, key) => {
        res[key] = getFieldExportingOptions(fields[key]);
        return res;
    }, result);
}

export function getFieldExportingOptions(field?: ServerField): ExportingColumnOptions {
    let format = field?.format;

    if (isDateField(field) && !format) {
        format = getDefaultDateFormat(field?.data_type);
    }

    return {
        title: field ? getFakeTitleOrTitle(field) : undefined,
        dataType: field?.data_type,
        format,
    };
}
