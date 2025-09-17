import {isObject} from 'lodash';

import type {IChartEditor, Update} from '../../../../../shared';
import type {
    ApiV2Filter,
    ApiV2OrderBy,
    ApiV2Parameter,
    ApiV2Ref,
    ApiV2Request,
    ApiV2RequestField,
    ApiV2ResponseField,
    ApiV2ResultData,
    ApiV2ResultDataRow,
} from '../../../../../shared/types/bi-api/v2';

const OPERATIONS = {
    ISNULL: 'ISNULL',
    ISNOTNULL: 'ISNOTNULL',
    GT: 'GT',
    LT: 'LT',
    GTE: 'GTE',
    LTE: 'LTE',
    EQ: 'EQ',
    NE: 'NE',
    STARTSWITH: 'STARTSWITH',
    ISTARTSWITH: 'ISTARTSWITH',
    ENDSWITH: 'ENDSWITH',
    IENDSWITH: 'IENDSWITH',
    CONTAINS: 'CONTAINS',
    ICONTAINS: 'ICONTAINS',
    NOTCONTAINS: 'NOTCONTAINS',
    NOTICONTAINS: 'NOTICONTAINS',
    IN: 'IN',
    NIN: 'NIN',
    BETWEEN: 'BETWEEN',
};

const ORDERS = {
    DESC: 'DESC',
    ASC: 'ASC',
};

type Options = {utc?: boolean; disableProcessDates?: boolean};

function getTimezoneOffsettedTime(value: Date) {
    return value.getTime() - value.getTimezoneOffset() * 60 * 1000;
}

function convertSimpleType(data: null | string, dataType: string, options: Options) {
    if (data === null) {
        return null;
    }

    switch (dataType) {
        case 'integer':
        case 'uinteger':
        case 'float':
            return Number(data);
        case 'date':
        case 'datetime':
        case 'genericdatetime':
        case 'datetimetz': {
            if (options.disableProcessDates) {
                return data;
            }
            const date = new Date(data);

            if (!options.utc) {
                date.setTime(getTimezoneOffsettedTime(date));
            }

            return date;
        }
        case 'string':
        default:
            return data;
    }
}

function getTypedData(data: string | null, dataType: string, options: Options) {
    return convertSimpleType(data, dataType, options);
}

function getResultRows(
    data: ApiV2ResultData['result_data'],
    fields: ApiV2ResponseField[],
    options: Options,
) {
    const fieldsDict = fields.reduce((acc: Record<number, ApiV2ResponseField>, field) => {
        acc[field.legend_item_id!] = field;
        return acc;
    }, {});

    const rows = data[0];

    return rows.rows.map((item: ApiV2ResultDataRow) => {
        const rowHash: Record<string, any> = {};
        const rowData = item.data;
        const rowLegend = item.legend;

        rowData.forEach((rowDataItem, rowDataItemIndex) => {
            const rowField = fieldsDict[rowLegend[rowDataItemIndex]]!;

            const columnId = rowField.title;
            const columnType = rowField.data_type;

            rowHash[columnId] = getTypedData(rowDataItem, columnType, options);
        });

        return rowHash;
    });
}

function processTableData(
    resultData: ApiV2ResultData['result_data'],
    fields: ApiV2ResponseField[],
    options = {},
) {
    return getResultRows(resultData, fields, options);
}

const mapColumnsToRequestFields = (columns: string[]): ApiV2RequestField[] => {
    return columns.map((fieldId) => ({
        ref: {
            type: 'title',
            title: fieldId,
        },
        block_id: 0,
    }));
};

type BuildSourcePayload = {
    id?: string;
    datasetId?: string;
    columns: string[];
    where?: {
        column: string;
        type?: 'title' | 'id';
        operation: string;
        values: string[];
    }[];
    order_by?: {
        direction: string;
        column: string;
    }[];
    cache: number;
    disable_group_by: boolean;
    limit?: number;
    offset?: number;
    updates?: Update[];
    ui: boolean;
    parameters?: {id: string; value: string}[];
};

function buildSource(payload: BuildSourcePayload) {
    const fields = mapColumnsToRequestFields(payload.columns);

    const filters: ApiV2Filter[] | undefined = payload.where?.map((filter) => {
        const type = filter.type || 'title';
        const value = filter.column || '';

        const ref: ApiV2Ref =
            type === 'title'
                ? {
                      type: 'title',
                      title: value,
                  }
                : {
                      type: 'id',
                      id: value,
                  };

        return {
            ref,
            operation: filter.operation,
            values: filter.values,
        };
    });

    const order_by: ApiV2OrderBy[] | undefined = payload.order_by?.map(({direction, column}) => ({
        ref: {type: 'title', title: column},
        direction: direction.toLowerCase(),
    }));

    const parameter_values: ApiV2Parameter[] | undefined = payload.parameters?.map((parameter) => {
        return {
            ref: {
                type: 'id',
                id: parameter.id,
            },
            value: parameter.value,
        };
    });

    let disable_group_by;

    if (payload.disable_group_by && typeof payload.disable_group_by !== 'undefined') {
        disable_group_by = true;
    }

    const requestData: ApiV2Request['data'] = {
        fields,
        filters,
        order_by,
        updates: payload.updates,
        parameter_values,
        limit: payload.limit,
        offset: payload.offset,
        disable_group_by,
        autofill_legend: true,
    };

    Object.keys(requestData).forEach((key) => {
        if (typeof (requestData as Record<string, any>)[key] === 'undefined') {
            delete (requestData as Record<string, any>)[key];
        }
    });

    return {
        datasetId: String(payload.id || payload.datasetId),
        path: 'result',
        data: requestData,
        ui: payload.ui,
        cache: payload.cache,
    };
}

function processData(
    data: Record<string, ApiV2ResultData>,
    field = 'dataset',
    ChartEditor: IChartEditor,
    options = {},
) {
    const dataResult = data[field]!;

    if (ChartEditor) {
        // we put the information for the inspector in ChartKit
        const query = dataResult.blocks.map((block) => block.query).join('\n');
        ChartEditor.setDataSourceInfo(field, {query});

        if (dataResult.data_export_forbidden) {
            ChartEditor.setExtra?.('dataExportForbidden', true);
        }
        if (dataResult.data_export) {
            ChartEditor.setExtraDataExport?.(field, dataResult.data_export);
        }
    }

    return processTableData(dataResult.result_data, dataResult.fields, options);
}

function getDatasetRows(params: {datasetName: string}) {
    if (!isObject(params)) {
        throw new Error('Params should be an object');
    }

    const {datasetName} = params;
    if (!datasetName) {
        throw new Error('datasetName is not defined in params');
    }

    const EditorAPI = (globalThis as unknown as {Editor: IChartEditor}).Editor;

    if (!EditorAPI) {
        throw new Error('EditorAPI is not defined');
    }

    const data = EditorAPI.getLoadedData();

    if (!data[datasetName]) {
        throw new Error(`Dataset "${datasetName}" is not defined`);
    }

    return processData(data, datasetName, EditorAPI, {disableProcessDates: true});
}

export default {
    buildSource,
    processTableData,
    processData,
    getDatasetRows,
    OPERATIONS,
    ORDERS,
};
