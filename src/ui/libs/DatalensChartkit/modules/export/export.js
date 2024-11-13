import {dateTimeUtc} from '@gravity-ui/date-utils';
import moment from 'moment';
import {DL} from 'ui/constants';
import {chartToTable} from 'ui/libs/DatalensChartkit/ChartKit/helpers/d3-chart-to-table';
import {registry} from 'ui/registry';
import {isEmbeddedEntry} from 'ui/utils/embedded';

import {
    DL_EMBED_TOKEN_HEADER,
    WidgetKind,
    getFormatOptions,
    getXlsxNumberFormat,
    isMarkupItem,
} from '../../../../../shared';
import logger from '../../../../libs/logger';
import {chartsDataProvider} from '../../index';
import axiosInstance from '../axios/axios';
import {EXPORT_FORMATS} from '../constants/constants';
import LocalStorage from '../localStorage';
import settings from '../settings/settings';
import {markupToRawString} from '../table';

const LOCAL_STORAGE_KEY = 'charts-export-state';

const DEFAULT_STATE = {
    format: 'csv',
    delValues: ';',
    delNumbers: '.',
    encoding: 'utf8',
};

// TODO: take it from the Table, (but prevent adding a dt100 to include webpack section)
const TABLE_DATE_FORMAT_BY_SCALE = {
    d: 'DD.MM.YYYY',
    w: 'DD.MM.YYYY',
    m: 'MMMM YYYY',
    h: 'DD.MM.YYYY HH:mm',
    i: 'DD.MM.YYYY HH:mm',
    s: 'DD.MM.YYYY HH:mm:ss',
    q: 'YYYY',
    y: 'YYYY',
};

//TODO: use only api_prefix
const API = DL.API_PREFIX ? `${DL.API_PREFIX}/export` : '/api/export';

function tableHeadToGraphs(head, prefix) {
    return head.reduce((result, column) => {
        const title = column.name ?? column.id ?? column.type ?? '';

        if (column.sub) {
            result = result.concat(
                tableHeadToGraphs(column.sub, prefix ? `${prefix} – ${title}` : title),
            );
        } else {
            result.push({
                ...column,
                title: (prefix ? `${prefix} - ` : '') + title,
                type: column.type,
                // TODO: in theory, you need if column.type === 'date'
                scale: column.scale || 'd',
                data: [],
            });
        }
        return result;
    }, []);
}

function prepareCellValue(cell) {
    return Array.isArray(cell) ? prepareRowHeadersForGrid(cell) : [cell.value];
}

function prepareRowHeadersForGrid(grid) {
    let result = [];
    grid.forEach((level) => {
        let levelResult = [];
        level.forEach((cell) => {
            levelResult = levelResult.concat(prepareCellValue(cell));
        });

        if (result.length === 0) {
            result = levelResult;
        } else {
            const realResult = [];
            result.forEach((resultValue) => {
                levelResult.forEach((levelResultValue) => {
                    realResult.push(`${resultValue} — ${levelResultValue}`);
                });
            });

            result = realResult;
        }
    });

    return result;
}

function getColumnExportOptions(widget, columnName) {
    const csvOptions = widget.userOptions?.exporting?.csv || {};
    const columnHeadersOptions = [
        ...Object.values(csvOptions.custom?.columnHeaderMap || {}),
        csvOptions.custom?.categoryHeader,
    ];

    const colOptions = columnHeadersOptions.find(
        (headerOptions) => headerOptions?.title === columnName,
    );

    return colOptions || {};
}

function getXlsxFormattedCellData(value, options) {
    if (!value) {
        return undefined;
    }

    const {type, format} = options || {};
    if (['date', 'datetime', 'genericdatetime'].includes(type)) {
        let dateFormat = format;
        if (!dateFormat) {
            dateFormat = type === 'date' ? 'yyyy-mm-dd' : 'yyyy-mm-dd hh:mm:sss';
        }

        let dateValue = value;

        if (typeof value === 'string') {
            dateValue = dateTimeUtc({input: value, format: dateFormat});
            if (!dateValue?.isValid()) {
                dateValue = dateTimeUtc({input: value});
            }
            if (dateValue?.isValid()) {
                return {
                    v: dateValue.toISOString(),
                    t: 'd',
                    z: dateFormat.toLowerCase(),
                };
            }
        }

        if (!dateValue) {
            return {v: value};
        }

        return {
            v: dateValue,
            t: 'd',
            z: dateFormat.toLowerCase(),
        };
    }

    return undefined;
}

function prepareValues({widget, data, widgetType, extra, options = {}}) {
    const {format} = options;

    switch (widgetType) {
        case WidgetKind.D3: {
            return prepareValues({
                widget: {},
                data: chartToTable({chartData: data}),
                widgetType: WidgetKind.Table,
            });
        }
        case WidgetKind.Graph: {
            if (!widget) {
                return {};
            }

            let dataRows;
            try {
                dataRows = widget.getDataRows();
            } catch (error) {
                logger.logError('ChartKit: Export error, widget.getDataRows failed', error);
                return {};
            }

            return {
                graphs: dataRows.reduce((result, data, rowIndex) => {
                    if (rowIndex === 0) {
                        data.forEach((value, index) => {
                            const columnExportOptions = getColumnExportOptions(widget, value);
                            result[index] = {
                                data: [],
                                title: value,
                                type: columnExportOptions.dataType,
                                formatting: columnExportOptions.formatting,
                                format: columnExportOptions.format,
                            };
                        });
                    } else {
                        data.forEach((value, index) => {
                            let cellData = value;

                            if (format === EXPORT_FORMATS.XLSX) {
                                const formattedCellData = getXlsxFormattedCellData(
                                    value,
                                    result[index],
                                );

                                if (formattedCellData) {
                                    cellData = formattedCellData;
                                }
                            }

                            result[index].data[rowIndex - 1] = cellData;
                        });
                    }
                    return result;
                }, []),
            };
        }
        case WidgetKind.Table: {
            const {head} = data;
            const rows = data.rows || [];
            const footer = data.footer || [];
            const fieldsList =
                (extra?.datasets || []).map((ds) => ds.fieldsList || []).flat(2) || [];

            const graphs = tableHeadToGraphs(head);
            const allTableRows = [...rows, ...footer];

            allTableRows.forEach((row, rowIndex) => {
                const cells = row.values?.map((value) => ({value})) || row.cells;
                cells.forEach((cell, index) => {
                    const value = cell.grid || cell.value;
                    const graph = graphs[index];

                    if (typeof graph === 'undefined') {
                        return;
                    }

                    if (format === EXPORT_FORMATS.XLSX) {
                        const cellType = cell.type || graph.type;
                        const cellFormat = cell.format || graph.format;
                        const formattedCellData = getXlsxFormattedCellData(value, {
                            type: cellType,
                            format: cellFormat,
                        });

                        if (formattedCellData) {
                            graph.data[rowIndex] = formattedCellData;
                            return;
                        }
                    }

                    if (isMarkupItem(value)) {
                        graph.data.push(markupToRawString(value));
                    } else if (graph.type === 'date') {
                        const dateFormat = graph.format
                            ? graph.format
                            : TABLE_DATE_FORMAT_BY_SCALE[graph.scale];
                        graph.data[rowIndex] = value ? moment.utc(value).format(dateFormat) : value;
                    } else if (graph.type === 'grid') {
                        if (index === 0) {
                            const prepared = prepareRowHeadersForGrid(value);
                            graph.data = graph.data.concat(prepared);
                        } else {
                            const prepared = value.map((cell) => cell.value);
                            graph.data = graph.data.concat(prepared);
                        }
                    } else if (format === EXPORT_FORMATS.XLSX && cell.type === 'number') {
                        let formatting;
                        const cellField = fieldsList.find((field) => field.guid === cell.fieldId);

                        if (cellField) {
                            formatting = getFormatOptions({
                                formatting: cellField.formatting,
                                data_type: cellField.dataType,
                            });
                        }

                        graph.data[rowIndex] = {
                            v: cell.value,
                            t: 'n',
                            z: getXlsxNumberFormat(Number(cell.value), formatting),
                        };
                    } else {
                        graph.data[rowIndex] = value;
                    }
                });
            });

            return {graphs};
        }
    }

    return null;
}

function getStorageState() {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || DEFAULT_STATE;
}

function setStorageState(state) {
    LocalStorage.store(LOCAL_STORAGE_KEY, state);
}

function tryConvertData(action, args) {
    try {
        const data = action(args);

        return {
            status: 'success',
            isCopyToClipboard: true,
            data,
        };
    } catch (error) {
        console.error(error);

        return {
            status: 'fail',
            error,
        };
    }
}

function convertDataToMarkdown({widget, data, widgetType}) {
    const {graphs = []} = prepareValues({widget, data, widgetType});
    const amountOfTableRows = Math.max(...graphs.map((graph) => graph.data.length));

    const result = graphs.reduce(
        (acc, graph, graphLevel) => {
            const isFirstColumn = graphLevel === 0;
            const isLastColumn = graphLevel === graphs.length - 1;

            acc.header += `${graph.title}|${isLastColumn ? '\n' : ''}`;

            if (isFirstColumn) {
                acc.divider += '|:-|';
            } else if (isLastColumn) {
                acc.divider += '-:|\n';
            } else {
                acc.divider += ':-:|';
            }

            for (let dataLevel = 0; dataLevel < amountOfTableRows; dataLevel++) {
                if (!acc.cells[dataLevel]) {
                    acc.cells[dataLevel] = '|';
                }

                const value =
                    graph.data[dataLevel] ||
                    graph.data[dataLevel] === 0 ||
                    graph.data[dataLevel] === null
                        ? graph.data[dataLevel]
                        : ' ';

                acc.cells[dataLevel] += `${value}|${isLastColumn ? '\n' : ''}`;
            }

            return acc;
        },
        {
            header: '|',
            divider: '',
            cells: {},
        },
    );

    return `${result.header}${result.divider}${Object.values(result.cells).join('')}`;
}

function convertDataToWiki({widget, data, widgetType}) {
    const {graphs} = prepareValues({widget, data, widgetType});
    const amountOfTableRows = Math.max(...graphs.map((graph) => graph.data.length));

    const result = graphs.reduce(
        (acc, graph, graphLevel) => {
            const isLastColumn = graphLevel === graphs.length - 1;

            acc.header += `**${graph.title}**${isLastColumn ? '||\n' : '|'}`;

            for (let dataLevel = 0; dataLevel < amountOfTableRows; dataLevel++) {
                if (!acc.cells[dataLevel]) {
                    acc.cells[dataLevel] = '|| ';
                }

                const value =
                    graph.data[dataLevel] ||
                    graph.data[dataLevel] === 0 ||
                    graph.data[dataLevel] === null
                        ? graph.data[dataLevel]
                        : ' ';

                acc.cells[dataLevel] += `${value}${isLastColumn ? ' ||\n' : ' | '}`;
            }

            return acc;
        },
        {
            header: '||',
            cells: {},
        },
    );

    return `#|\n${result.header}${Object.values(result.cells).join('')}|#`;
}

async function exportWidget({
    widget,
    data,
    widgetType,
    options,
    exportFilename,
    extra,
    downloadName,
}) {
    const params = {
        formSettings: options,
        lang: settings.lang,
        // downloadConfig: props.downloadConfig,
        chartData: prepareValues({widget, data, widgetType, options, extra}),
        fullHost: chartsDataProvider.endpoint,
    };

    const stringifyData = encodeURIComponent(JSON.stringify(params));

    const headers = {};

    if (isEmbeddedEntry()) {
        const getSecureEmbeddingToken = registry.chart.functions.get('getSecureEmbeddingToken');
        headers[DL_EMBED_TOKEN_HEADER] = getSecureEmbeddingToken();
    }

    const request = {
        url: `${chartsDataProvider.endpoint}${API}`,
        method: 'post',
        data: {data: stringifyData, exportFilename},
        responseType: 'blob',
        headers,
    };

    // append and remove are needed in particular for FireFox
    // CHARTS-569
    // https://stackoverflow.com/questions/30694453
    return axiosInstance(chartsDataProvider.prepareRequestConfig(request)).then(
        (response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = downloadName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return {status: 'success'};
        },
        (error) => {
            return {status: 'fail', error};
        },
    );
}

export default async ({
    widget,
    widgetDataRef,
    data,
    widgetType,
    options = getStorageState(),
    exportFilename,
    extra,
    downloadName,
}) => {
    setStorageState(options);

    const {format} = options;

    switch (format) {
        case EXPORT_FORMATS.MARKDOWN: {
            return tryConvertData(convertDataToMarkdown, {
                widget: widgetDataRef?.current || widget,
                data,
                widgetType,
            });
        }
        case EXPORT_FORMATS.WIKI: {
            return tryConvertData(convertDataToWiki, {
                widget: widgetDataRef?.current || widget,
                data,
                widgetType,
            });
        }

        default: {
            return exportWidget({
                widget: widgetDataRef?.current || widget,
                data,
                widgetType,
                options,
                exportFilename,
                extra,
                downloadName,
            });
        }
    }
};

export {getStorageState, convertDataToMarkdown, convertDataToWiki, prepareValues};
