import type {IChartEditor} from '../../../../../../shared';
import {DATALENS_QL_TYPES} from '../../../../../../shared';
import type {
    QlConfig,
    QlConfigPreviewTableDataRow,
    QlConfigResultEntryMetadataDataColumn,
} from '../../../../../../shared/types/config/ql';
import {DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT} from '../utils/constants';
import {formatUnknownTypeValue, parseNumberValueForTable} from '../utils/misc-helpers';

export default ({
    shared: _shared,
    columns,
    rows,
    ChartEditor: _ChartEditor,
}: {
    shared: QlConfig;
    columns: QlConfigResultEntryMetadataDataColumn[];
    rows: string[][];
    ChartEditor: IChartEditor;
}) => {
    if (columns === null) {
        return {};
    }

    const columnTypes = columns.map((column) => column.typeName);
    const knownColumnNames = new Set();

    const head = columns.map((column: QlConfigResultEntryMetadataDataColumn, index) => {
        const columnType = columnTypes[index];
        let tableColumnType;
        let tableColumnFormat;

        if (columnType === DATALENS_QL_TYPES.NUMBER) {
            tableColumnType = 'number';
        } else if (
            columnType === DATALENS_QL_TYPES.DATE ||
            columnType === DATALENS_QL_TYPES.DATETIME
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

        let uniqueColumnName = column.name;

        while (knownColumnNames.has(uniqueColumnName)) {
            if (/-(\d+)$/.test(uniqueColumnName)) {
                uniqueColumnName = uniqueColumnName.replace(
                    /-(\d+)$/,
                    (_substring, uniqueIndex) => {
                        return `-${Number(uniqueIndex) + 1}`;
                    },
                );
            } else {
                uniqueColumnName = `${uniqueColumnName}-1`;
            }
        }

        knownColumnNames.add(uniqueColumnName);

        return {
            name: uniqueColumnName,
            header: column.name,
            title: column.name,
            type: tableColumnType,
            format: tableColumnFormat,
        };
    });

    const result = {
        columns: head,
        data: rows.map((row: string[]) => {
            const tableRow: QlConfigPreviewTableDataRow = {};
            head.forEach(({name}, index) => {
                let cellValue;

                const value = row[index];

                if (columnTypes[index] === DATALENS_QL_TYPES.NUMBER) {
                    cellValue = parseNumberValueForTable(value);
                } else if (
                    columnTypes[index] === DATALENS_QL_TYPES.DATE ||
                    columnTypes[index] === DATALENS_QL_TYPES.DATETIME
                ) {
                    cellValue = value;
                } else if (
                    columnTypes[index] === DATALENS_QL_TYPES.UNKNOWN ||
                    // We need to wait for BI-4892
                    // Temporarily checking type missmatch
                    (value && typeof value === 'object' && columnTypes[index] === 'string')
                ) {
                    cellValue = formatUnknownTypeValue(value);
                } else {
                    cellValue = value;
                }

                tableRow[name] = cellValue;
            });

            return tableRow;
        }),
    };

    return result;
};
