import type {
    ColumnExportSettings,
    ExportingColumnOptions,
    ServerField,
} from '../../../../../../shared';
import {
    getFakeTitleOrTitle,
    getFormatOptions,
    isDateField,
    isNumberField,
} from '../../../../../../shared';

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

export function getExportColumnSettings(args: {
    path: string;
    field?: ServerField;
}): ColumnExportSettings {
    const {path, field} = args;

    let columnType: ColumnExportSettings['type'] = 'text';
    let formatter: ColumnExportSettings['formatter'] = {};
    let format: ColumnExportSettings['format'];

    if (isNumberField(field)) {
        columnType = 'number';
        formatter = getFormatOptions(field);
    } else if (isDateField(field)) {
        columnType = field.data_type;
        format = field.format ?? getDefaultDateFormat(field.data_type);
    }

    return {
        name: getFakeTitleOrTitle(field),
        formatter,
        format,
        field: path,
        type: columnType,
    };
}
