import moment from 'moment';

import type {IChartEditor, QlConfigPreviewTableData} from '../../../../../../shared';
import {DATALENS_QL_TYPES} from '../../../../../../shared';
import type {
    QlConfig,
    QlConfigResultEntryMetadataDataColumn,
    QlConfigResultEntryMetadataDataColumnOrGroup,
} from '../../../../../../shared/types/config/ql';
import {DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT} from '../utils/constants';
import type {QLRenderResultTable} from '../utils/misc-helpers';
import {formatUnknownTypeValue, isGroup, parseNumberValueForTable} from '../utils/misc-helpers';

export default ({
    shared,
    columns,
    rows,
    tablePreviewData,
}: {
    shared: QlConfig;
    columns: QlConfigResultEntryMetadataDataColumn[];
    rows: string[][];
    ChartEditor: IChartEditor;
    tablePreviewData?: QlConfigPreviewTableData;
}) => {
    if (columns === null) {
        return {};
    }

    const columnTypes = columns.map((column) => column.typeName);

    const orderColumns: QlConfigResultEntryMetadataDataColumn[] = [];
    const orderAvailable: QlConfigResultEntryMetadataDataColumn[] = [];

    const result: QLRenderResultTable = {
        head: [],
        rows: [],
        tablePreviewData,
    };

    const displayedColumnsIndices: number[] = [];

    if (shared.order && shared.order.length) {
        let collectingColumns = false;
        let collectingAvailable = false;

        shared.order.forEach((item: QlConfigResultEntryMetadataDataColumnOrGroup) => {
            const itemIsGroup = isGroup(item);

            if (itemIsGroup && item.name === 'Columns') {
                collectingColumns = true;
                return;
            }

            if (itemIsGroup && item.name === 'Available') {
                collectingColumns = false;
                collectingAvailable = true;
                return;
            }

            if (collectingColumns && !itemIsGroup) {
                const itemIndex = columns.findIndex((column) => column.name === item.name);

                if (itemIndex > -1) {
                    orderColumns.push(columns[itemIndex]);
                    displayedColumnsIndices.push(itemIndex);
                }
            }

            if (collectingAvailable && !itemIsGroup) {
                const itemIndex = columns.findIndex((column) => column.name === item.name);

                if (itemIndex > -1) {
                    orderAvailable.push(columns[itemIndex]);
                }
            }
        });
    } else {
        columns.forEach((column, index) => {
            orderColumns.push(column);
            displayedColumnsIndices.push(index);
        });
    }

    columns.forEach((column) => {
        if (orderAvailable.indexOf(column) === -1 && orderColumns.indexOf(column) === -1) {
            orderAvailable.push(column);
        }
    });

    result.head = displayedColumnsIndices.map((index) => {
        let tableColumnType;
        let tableColumnFormat;

        const columnType = columnTypes[index];

        if (columnType === DATALENS_QL_TYPES.NUMBER) {
            tableColumnType = 'number';
        } else if (
            columnType === DATALENS_QL_TYPES.DATETIME ||
            columnType === DATALENS_QL_TYPES.DATE
        ) {
            if (columnType === DATALENS_QL_TYPES.DATETIME) {
                tableColumnFormat = DEFAULT_DATETIME_FORMAT;
            } else if (columnType === DATALENS_QL_TYPES.DATE) {
                tableColumnFormat = DEFAULT_DATE_FORMAT;
            }

            tableColumnType = 'date';
        } else {
            tableColumnType = 'string';
        }

        return {
            name: columns[index].name,
            type: tableColumnType,
            format: tableColumnFormat,
        };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.rows = rows.map((row: any[]) => {
        return {
            values: displayedColumnsIndices.map((index) => {
                let cellValue;

                if (columnTypes[index] === DATALENS_QL_TYPES.NUMBER) {
                    cellValue = parseNumberValueForTable(row[index]);
                } else if (
                    columnTypes[index] === DATALENS_QL_TYPES.DATETIME ||
                    columnTypes[index] === DATALENS_QL_TYPES.DATE
                ) {
                    cellValue = moment.utc(row[index]).valueOf();
                } else if (columnTypes[index] === DATALENS_QL_TYPES.UNKNOWN) {
                    cellValue = formatUnknownTypeValue(row[index]);
                } else {
                    cellValue = row[index];
                }

                return cellValue;
            }),
        };
    });

    const order: QlConfigResultEntryMetadataDataColumnOrGroup[] = [
        {
            name: 'Columns',
            group: true,
            undragable: true,
            size: 0,
        },
        ...orderColumns,
        {
            name: 'Available',
            group: true,
            undragable: true,
            size: 0,
        },
        ...orderAvailable,
    ];

    result.metadata = {order};

    return result;
};
