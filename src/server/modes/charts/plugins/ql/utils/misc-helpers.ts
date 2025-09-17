import type {YagrConfig} from '@gravity-ui/chartkit/yagr';
import {dateTimeParse} from '@gravity-ui/date-utils';

import type {
    IChartEditor,
    QLChartType,
    QlConfigPreviewTableData,
    ServerVisualization,
    StringParams,
} from '../../../../../../shared';
import {
    ConnectorType,
    DATALENS_QL_CONNECTION_TYPES,
    DATALENS_QL_TYPES,
    QLParamType,
    WizardVisualizationId,
    biToDatalensQL,
    getDatalensQLTypeName,
    getUtcDateTime,
    isMonitoringOrPrometheusChart,
} from '../../../../../../shared';
import type {
    QLConfigQuery,
    QlConfigParam,
    QlConfigParamInterval,
    QlConfigRequestParam,
    QlConfigResultEntryMetadataDataColumn,
    QlConfigResultEntryMetadataDataColumnOrGroup,
    QlConfigResultEntryMetadataDataGroup,
} from '../../../../../../shared/types/config/ql';
import {CONNECTIONS_DASHSQL, CONNECTION_ID_PLACEHOLDER} from '../../control/url/constants';

import type {QLConnectionTypeMap} from './connection';
import {convertConnectionType} from './connection';
import {LINEAR_VISUALIZATIONS, LOG_INFO, LOG_TIMING, QUERY_TITLE} from './constants';

export {
    formatUnknownTypeValue,
    renderValue,
    parseNumberValue,
    parseNumberValueForTable,
} from './value-helpers';

let currentConsole: {log: Function} = console;

export function setConsole(newConsole: {log: Function}) {
    currentConsole = newConsole;
}

export function log(...data: unknown[]) {
    return LOG_INFO && currentConsole.log(...data);
}

export function logTiming(...data: unknown[]) {
    return LOG_TIMING && currentConsole.log(...data);
}

export interface QLResultEntryMetadata {
    event: 'metadata';
    data: {
        names: string[];
        driver_types: (string | number)[];
        postgresql_typnames?: string[];
        bi_types: string[];
    };
}

export interface QLResultEntry {
    event: string;
    data: unknown;
}

export interface QLResultEntryData {
    event: 'data';
    data: string[];
}

export interface QLResult {
    [key: string]: {
        events: QLResultEntry[];
        data_export: any;
    };
}

export interface QLRenderResultTable {
    head: {};
    rows: {};
    metadata?: {
        order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    };
    tablePreviewData?: QlConfigPreviewTableData;
}

export interface QLRenderResultMetric {
    content: {
        current: {
            value: string | number;
            precision: number;
        };
    };
    title: string;
    metadata?: {
        order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    };
}

export type QLValue = string | number | null;

export type QLRenderResultHCGraphData = (
    | number
    | null
    | {
          name?: string;
          y: QLValue;
      }
)[];

export interface QLRenderResultHCGraph {
    data: QLRenderResultHCGraphData;
    title?: string | number;
}

export interface QLRenderResultHC {
    categories?: (string | number)[];
    categories_ms?: (string | number)[];
    metadata?: {
        order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    };
    graphs?: QLRenderResultHCGraph[];
    tablePreviewData?: QlConfigPreviewTableData;
}

export interface QLRenderResultYagrGraph {
    data: (number | null)[];
    id?: string | number;
    name?: string | number;
    color?: string;
    sum?: number;
    spanGaps?: boolean;
}

export interface QLRenderResultYagr {
    timeline?: number[];
    metadata?: {
        order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    };
    graphs?: QLRenderResultYagrGraph[];
    axes?: any[];
    tablePreviewData?: QlConfigPreviewTableData;
    timeZone?: string;
    tooltip?: YagrConfig['tooltip'];
}

const clickhouseQuotemap: Record<string, string> = {
    // Unlike most databases, CH only works with binary strings
    // (not unicode), and supports entering a 0 byte via \0.
    '\b': '\\b',
    '\f': '\\f',
    '\r': '\\r',
    '\n': '\\n',
    '\t': '\\t',
    '\0': '\\0',
    '\\': '\\\\',
    "'": "\\'",
};

function escapeSingleForClickhouse(input: string, type: string) {
    const escapedValue = String(input).replace(
        /([\b\f\r\n\t\0\\'])/g,
        (match) => clickhouseQuotemap[match],
    );
    switch (type) {
        case QLParamType.String:
            return `'${escapedValue}'`;

        case QLParamType.Number:
        case QLParamType.Boolean:
            return escapedValue;

        case QLParamType.Date:
        case QLParamType.DateInterval:
            // The time is already in UTC, so we do .utc() so it does not convert once again
            return `toDate('${dateTimeParse(escapedValue, {timeZone: 'UTC'})?.format(
                'YYYY-MM-DD',
            )}')`;

        case QLParamType.Datetime:
        case QLParamType.DatetimeInterval:
            // The time is already in UTC, so we do .utc() so it does not convert once again
            return `toDateTime('${dateTimeParse(escapedValue, {timeZone: 'UTC'})?.format(
                'YYYY-MM-DD HH:mm:ss',
            )}')`;
        default:
            throw new Error('Unsupported parameter type passed');
    }
}

const quotemap: Record<string, string> = {
    // Common to most databases: quotas via backslash, with the exception of
    // the 0 byte, which can only be cut.
    '\b': '\\b',
    '\f': '\\f',
    '\r': '\\r',
    '\n': '\\n',
    '\t': '\\t',
    '\0': '',
    '\\': '\\\\',
    "'": "\\'",
};

function escapeSingleForPostgreSQL(input: string, type: string) {
    const escapedValue = String(input).replace(/([\b\f\r\n\t\0\\'])/g, (match) => quotemap[match]);
    switch (type) {
        case QLParamType.String:
            return `E'${escapedValue}'`;

        case QLParamType.Number:
        case QLParamType.Boolean:
            return escapedValue;

        case QLParamType.Date:
        case QLParamType.DateInterval:
            // The time is already in UTC, so we do .utc() so it does not convert once again
            return `'${dateTimeParse(escapedValue, {timeZone: 'UTC'})?.format(
                'YYYY-MM-DD',
            )}'::date`;

        case QLParamType.Datetime:
        case QLParamType.DatetimeInterval:
            // The time is already in UTC, so we do .utc() so it does not convert once again
            return `'${dateTimeParse(escapedValue, {timeZone: 'UTC'})?.format(
                'YYYY-MM-DDTHH:mm:ss',
            )}'::timestamp`;
        default:
            throw new Error('Unsupported parameter type passed');
    }
}

function escapeSingleOther(input: string, type: string) {
    const escapedValue = String(input).replace(/([\b\f\r\n\t\0\\'])/g, (match) => quotemap[match]);
    switch (type) {
        case QLParamType.String:
            return `'${escapedValue}'`;

        case QLParamType.Number:
        case QLParamType.Boolean:
            return escapedValue;

        case QLParamType.Date:
        case QLParamType.DateInterval:
            // The time is already in UTC, so we do .utc() so it does not convert once again
            return `'${dateTimeParse(escapedValue, {timeZone: 'UTC'})?.format('YYYY-MM-DD')}'`;

        case QLParamType.Datetime:
        case QLParamType.DatetimeInterval:
            // The time is already in UTC, so we do .utc() so it does not convert once again
            return `'${dateTimeParse(escapedValue, {timeZone: 'UTC'})?.format(
                'YYYY-MM-DDTHH:mm:ss',
            )}'`;
        default:
            throw new Error('Unsupported parameter type passed');
    }
}

function wrapQuotedValue(quotedValue: string, operation?: string) {
    switch (operation?.toLowerCase()) {
        case 'in':
            return `(${quotedValue})`;

        case '=':
        default:
            return quotedValue;
    }
}

function escape(
    input: string[] | string,
    connectionType: string,
    paramDescription?: QlConfigParam,
    operation?: string,
) {
    const type = paramDescription ? paramDescription.type.toLowerCase() : 'string';

    let quoter = escapeSingleOther;

    if (connectionType === DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE) {
        quoter = escapeSingleForClickhouse;
    } else if (connectionType === DATALENS_QL_CONNECTION_TYPES.POSTGRESQL) {
        quoter = escapeSingleForPostgreSQL;
    }

    if (Array.isArray(input)) {
        if (input.length === 1) {
            return wrapQuotedValue(quoter(String(input[0]), type), operation);
        } else {
            const result = input.map((inputEntry) => quoter(inputEntry, type)).join(', ');

            return `(${result})`;
        }
    } else {
        return wrapQuotedValue(quoter(String(input), type), operation);
    }
}

function dumpReqParamValue(input: string, type: string, datalensQLConnectionType?: ConnectorType) {
    let newValue;

    switch (type) {
        case QLParamType.String:
        case QLParamType.Number:
        case QLParamType.Boolean:
            newValue = input;
            break;

        case QLParamType.Date:
        case QLParamType.DateInterval:
            if (
                datalensQLConnectionType === DATALENS_QL_CONNECTION_TYPES.MONITORING ||
                datalensQLConnectionType === DATALENS_QL_CONNECTION_TYPES.PROMQL
            ) {
                newValue = getUtcDateTime(input)?.toISOString();

                if (!newValue) {
                    throw new Error('Invalid date passed');
                }
            } else {
                newValue = getUtcDateTime(input)?.format('YYYY-MM-DD');
            }

            if (!newValue) {
                newValue = 'Invalid date';
            }

            break;

        case QLParamType.Datetime:
        case QLParamType.DatetimeInterval:
            if (
                datalensQLConnectionType === ConnectorType.Monitoring ||
                datalensQLConnectionType === ConnectorType.Promql
            ) {
                newValue = getUtcDateTime(input)?.toISOString();

                if (!newValue) {
                    throw new Error('Invalid date passed');
                }
            } else {
                newValue = getUtcDateTime(input)?.format('YYYY-MM-DDTHH:mm:ss');
            }

            if (!newValue) {
                newValue = 'Invalid date';
            }

            break;

        default:
            throw new Error('Unsupported parameter type passed');
    }

    return newValue;
}

function dumpReqParam(
    input: string | string[],
    paramDescription: QlConfigParam,
    datalensQLConnectionType?: ConnectorType,
): QlConfigRequestParam {
    const type = paramDescription.type.toLowerCase();
    let dumped: string | string[];

    if (Array.isArray(input)) {
        if (input.length === 1) {
            dumped = dumpReqParamValue(String(input[0]), type, datalensQLConnectionType);
        } else {
            dumped = input.map((inputEntry) =>
                dumpReqParamValue(inputEntry, type, datalensQLConnectionType),
            );
        }
    } else {
        dumped = dumpReqParamValue(String(input), type, datalensQLConnectionType);
    }
    let bi_type = type;
    if (bi_type === 'number') {
        bi_type = 'float';
    }

    return {type_name: bi_type, value: dumped};
}

export function buildSource({
    id,
    connectionType,
    query,
    params,
    paramsDescription,
    qlConnectionTypeMap,
}: {
    id: string;
    connectionType: string;
    query: string;
    params: StringParams;
    paramsDescription: QlConfigParam[];
    qlConnectionTypeMap: QLConnectionTypeMap;
}) {
    let sqlQuery = query;

    const datalensQLConnectionType = convertConnectionType(qlConnectionTypeMap, connectionType);

    const QLRequestParams: Record<string, QlConfigRequestParam | QlConfigRequestParam[]> = {};
    if (
        datalensQLConnectionType === DATALENS_QL_CONNECTION_TYPES.POSTGRESQL ||
        datalensQLConnectionType === DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE
    ) {
        // For PG/CH, we temporarily leave the old version, for greater compatibility.
        if (params) {
            // For correctness, the replacement should occur with a single call to `replace`,
            // in order not to replace the excess in case the inserted new value
            // contains any `{{key}}`
            sqlQuery = sqlQuery.replace(
                /(\s*)(=|in)?(\s*)\{\{([^}]+)\}\}/gi,
                (_, spaceBefore, operation, spaceAfter, key) => {
                    const fixedKey = key.replace('_from', '').replace('_to', '');

                    const paramDescription = paramsDescription.find(
                        (param) => param.name === key || param.name === fixedKey,
                    );

                    let escapedValue;
                    if (paramDescription) {
                        escapedValue = escape(
                            params[key],
                            datalensQLConnectionType,
                            paramDescription,
                            operation,
                        );
                    } else {
                        escapedValue = key;
                    }

                    return `${
                        operation
                            ? `${spaceBefore}${operation}${spaceAfter}`
                            : `${spaceBefore}${spaceAfter}`
                    }${escapedValue}`;
                },
            );
        }
    } else {
        // For the rest - we leave the text as it is, we pass the parameters to the back.
        Object.keys(params).forEach((key) => {
            const paramDescription = paramsDescription.find((param) => param.name === key);
            if (paramDescription?.defaultValue !== undefined) {
                if (
                    paramDescription.type === QLParamType.DateInterval ||
                    paramDescription.type === QLParamType.DatetimeInterval
                ) {
                    paramDescription.type =
                        paramDescription.type === QLParamType.DateInterval
                            ? QLParamType.Date
                            : QLParamType.Datetime;

                    QLRequestParams[`${key}_from`] = dumpReqParam(
                        params[`${key}_from`],
                        {
                            ...paramDescription,
                            defaultValue: (paramDescription.defaultValue as QlConfigParamInterval)
                                .from,
                        },
                        datalensQLConnectionType,
                    );

                    QLRequestParams[`${key}_to`] = dumpReqParam(
                        params[`${key}_to`],
                        {
                            ...paramDescription,
                            defaultValue: (paramDescription.defaultValue as QlConfigParamInterval)
                                .to,
                        },
                        datalensQLConnectionType,
                    );
                } else {
                    QLRequestParams[key] = dumpReqParam(
                        params[key],
                        paramDescription,
                        datalensQLConnectionType,
                    );
                }
            }
        });
    }

    const payload = {
        sql_query: sqlQuery,
        params: QLRequestParams,
    };

    return {
        url: CONNECTIONS_DASHSQL.replace(CONNECTION_ID_PLACEHOLDER, id),
        method: 'post',
        data: payload,
    };
}

export function getRows(data: QLResult, field = 'sql'): string[][] {
    let rows: string[][] = [];

    rows = data[field].events
        .filter((entry: QLResultEntry) => entry.event === 'row')
        .map((entry: QLResultEntry) => entry.data) as string[][];

    return rows;
}

export function getColumns(args: {
    data: QLResult;
    connectionType: string;
    field?: string;
    qlConnectionTypeMap: QLConnectionTypeMap;
}): QlConfigResultEntryMetadataDataColumn[] | null {
    const {data, connectionType, field = 'sql', qlConnectionTypeMap} = args;
    const row = data[field].events.find((entry: QLResultEntry) => entry.event === 'metadata');

    const datalensQLConnectionType = convertConnectionType(qlConnectionTypeMap, connectionType);

    if (row) {
        const metadataRow = row as QLResultEntryMetadata;

        return metadataRow.data.names.map((name, idx) => {
            const bi_type = metadataRow.data.bi_types[idx];
            const driver_type =
                datalensQLConnectionType === DATALENS_QL_CONNECTION_TYPES.POSTGRESQL
                    ? (metadataRow.data.postgresql_typnames || [])[idx]
                    : metadataRow.data.driver_types[idx];

            return {
                name: name,

                // typeName -- legacy type, incompatible with Field
                // we can remove it once wizard ql common visualization will be enabled
                typeName:
                    (bi_type
                        ? biToDatalensQL(bi_type)
                        : getDatalensQLTypeName(driver_type, datalensQLConnectionType)) ||
                    DATALENS_QL_TYPES.UNKNOWN,

                // biType -- new type, compatable with Field
                biType: bi_type,
            };
        });
    } else {
        return null;
    }
}

export function getColumnsAndRows({
    chartType,
    ChartEditor,
    queries,
    connectionType,
    data,
    qlConnectionTypeMap,
}: {
    chartType: QLChartType;
    ChartEditor: IChartEditor;
    queries: QLConfigQuery[];
    connectionType: string;
    data: {[key: string]: any};
    qlConnectionTypeMap: QLConnectionTypeMap;
}) {
    let columns: QlConfigResultEntryMetadataDataColumn[] | null = [];

    const columnsOrder: Record<string, number[]> = {};
    const columnsByQuery: Record<string, QlConfigResultEntryMetadataDataColumn[]> = {};

    let rows: string[][] = [];

    if (isMonitoringOrPrometheusChart(chartType)) {
        iterateThroughVisibleQueries(queries, (_query, i) => {
            let localColumns: QlConfigResultEntryMetadataDataColumn[] = [];

            try {
                const parsedColumns = getColumns({
                    data,
                    connectionType,
                    field: `ql_${i}`,
                    qlConnectionTypeMap,
                });

                if (parsedColumns === null) {
                    return;
                }

                localColumns = parsedColumns;
            } catch (error) {
                ChartEditor._setError({
                    code: 'ERR.CK.PROCESSING_ERROR',
                });
            }

            localColumns.push({
                biType: 'string',
                name: QUERY_TITLE,
                typeName: 'string',
            });

            if (columns && columns.length > 0) {
                const uniqueLocalColumns = localColumns.filter((localColumn) => {
                    return columns?.find((column) => column.name === localColumn.name) === null;
                });

                columns = columns.concat(uniqueLocalColumns);

                columnsOrder[i] = uniqueLocalColumns.map((column) => {
                    return localColumns.findIndex((localColumn) => {
                        return localColumn.name === column.name;
                    });
                });

                columnsByQuery[i] = localColumns;
            } else {
                columns = localColumns;
                columnsOrder[i] = columns.map((_column, j) => j);
                columnsByQuery[i] = localColumns;
            }
        });
        iterateThroughVisibleQueries(queries, (query, i) => {
            let localRows;

            try {
                localRows = getRows(data, `ql_${i}`);
            } catch (error) {
                ChartEditor._setError({
                    code: 'ERR.CK.PROCESSING_ERROR',
                });
            }

            if (!localRows) {
                return;
            }

            localRows.forEach((row) => {
                row.push(query.queryName);
            });

            if (rows.length > 0) {
                localRows.forEach((localRow) => {
                    const newRow: string[] = [];

                    const localColumns = columnsByQuery[i];

                    columns?.forEach((column) => {
                        const targetColumnIndex = localColumns.findIndex(
                            (localColumn: QlConfigResultEntryMetadataDataColumn) =>
                                localColumn.name === column.name,
                        );

                        if (targetColumnIndex > -1) {
                            newRow.push(localRow[targetColumnIndex]);
                        } else {
                            newRow.push('null');
                        }
                    });

                    rows.push(newRow);
                });
            } else {
                rows = localRows;
            }
        });

        if (rows.length === 0) {
            return {};
        }
    } else {
        try {
            columns = getColumns({
                data,
                connectionType: connectionType || ConnectorType.Clickhouse,
                qlConnectionTypeMap,
            });

            if (columns !== null) {
                rows = getRows(data);
            }
        } catch (error) {
            ChartEditor._setError({
                code: 'ERR.CK.PROCESSING_ERROR',
            });
        }

        if (!columns || !rows || rows.length === 0) {
            return {};
        }
    }

    return {columns, rows};
}

export function isGroup(
    item: QlConfigResultEntryMetadataDataColumnOrGroup,
): item is QlConfigResultEntryMetadataDataGroup {
    return Boolean((item as QlConfigResultEntryMetadataDataGroup).group);
}

export function iterateThroughVisibleQueries(
    queries: QLConfigQuery[],
    cb: (query: QLConfigQuery, index: number, array: QLConfigQuery[]) => void,
) {
    queries.forEach((query, ...args) => {
        if (query.hidden) {
            return;
        }

        cb(query, ...args);
    });
}

export const prepareQuery = (query: string) => {
    return query.trim().replace(/;+$/g, '');
};

const removeComments = (query: string) => {
    const result = query.replace(
        /("(""|[^"])*")|('(''|[^'])*')|(--[^\n\r]*)|(\/\*[\w\W]*?(?=\*\/)\*\/)/gm,
        (match) => {
            if (
                (match[0] === '"' && match[match.length - 1] === '"') ||
                (match[0] === "'" && match[match.length - 1] === "'")
            )
                return match;

            return '';
        },
    );

    return result;
};

const removeQuotes = (query: string) => {
    // eslint-disable-next-line security/detect-unsafe-regex
    const result = query.replace(/(["'])(?:(?=(\\?))\2.)*?\1/gm, '');

    return result;
};

export const doesQueryContainOrderBy = (query: string) => {
    const queryWithoutComments = removeComments(removeQuotes(query));

    return /order by/gim.test(queryWithoutComments);
};

export const visualizationCanHaveContinuousAxis = (visualization: ServerVisualization) => {
    return (
        LINEAR_VISUALIZATIONS.has(visualization.id) ||
        visualization.id === WizardVisualizationId.BarXD3
    );
};
