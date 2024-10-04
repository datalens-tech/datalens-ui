import type {DateTimeInput} from '@gravity-ui/date-utils';
import {dateTimeUtc} from '@gravity-ui/date-utils';
import type {ColumnDef, SortingFnOption} from '@tanstack/react-table';
import {createColumnHelper} from '@tanstack/react-table';
import type {DisplayColumnDef, GroupColumnDef} from '@tanstack/table-core/build/lib/types';
import get from 'lodash/get';
import type {TableCellsRow, TableCommonCell, TableRow, TableTitle} from 'shared';

import type {TableWidgetData} from '../../../../../../types';
import {getTreeCellColumnIndex, getTreeSetColumnSortAscending} from '../../utils';

import type {TData, TFoot, THead} from './types';

function getSortingFunction(args: {
    th: THead;
    columnIndex: number;
    rows?: TableRow[];
}): SortingFnOption<TData> {
    const {th, columnIndex, rows} = args;
    const hasTreeCell = getTreeCellColumnIndex(rows?.[0] as TableCellsRow) !== -1;
    if (hasTreeCell) {
        return getTreeSetColumnSortAscending(columnIndex, rows ?? []);
    }

    const columnType: TableCommonCell['type'] = get(th, 'type');
    if (columnType === 'date') {
        return function (row1, row2) {
            const cell1Value = row1.original[columnIndex].value as DateTimeInput;
            const cell2Value = row2.original[columnIndex].value as DateTimeInput;

            const date1 = dateTimeUtc({input: cell1Value});
            const date2 = dateTimeUtc({input: cell2Value});

            if (date1 > date2 || (date1.isValid() && !date2.isValid())) {
                return 1;
            }

            if (date2 > date1 || (date2.isValid() && !date1.isValid())) {
                return -1;
            }

            return 0;
        };
    }

    if (columnType === 'number') {
        return function (row1, row2) {
            const cell1Value = row1.original[columnIndex].value as number;
            const cell2Value = row2.original[columnIndex].value as number;

            if (cell1Value > cell2Value) {
                return 1;
            }

            return cell1Value < cell2Value ? -1 : 0;
        };
    }

    return 'auto';
}

function createColumn(args: {
    headCell: THead;
    rows?: TableRow[];
    footerCell?: TFoot;
    index: number;
    size?: number;
}) {
    const {headCell, footerCell, index, size, rows} = args;
    const {id, width, cell, ...columnOptions} = headCell;
    const options = {
        ...columnOptions,
        id: `${id}__${index}`,
        meta: {
            width,
            footer: footerCell,
            head: headCell,
        },
        size,
        minSize: 0,
        sortingFn: getSortingFunction({th: headCell, columnIndex: index, rows}),
    } as ColumnDef<TData>;

    if (cell) {
        options.cell = (context) => {
            const originalCellData = context.row.original[index];
            return cell(originalCellData);
        };
    }

    if (footerCell) {
        if (cell) {
            options.footer = () => cell(footerCell);
        } else {
            options.footer = footerCell.formattedValue ?? (footerCell.value as string);
        }
    }

    return options;
}

export function createTableColumns(args: {
    head?: THead[];
    rows?: TableRow[];
    footer?: TFoot[];
    cellSizes?: null | number[];
}) {
    const {head = [], rows = [], footer = []} = args;
    const cellSizes = args.cellSizes || [];
    const columnHelper = createColumnHelper<TData>();

    let lastColumnIndex = 0;
    const createHeadColumns = (cells: THead[], defaultWidth = 0): ColumnDef<TData>[] => {
        return cells.map((headCell) => {
            const cellIndex = headCell.columns?.length ? -1 : lastColumnIndex;
            const footerCell = footer?.[cellIndex];
            const columnWidth =
                typeof headCell.width === 'number' ? Number(headCell.width) : defaultWidth;
            const size = cellSizes[cellIndex] ?? columnWidth;
            const left = cellSizes.reduce(
                (sum, _s, index) => (index < cellIndex ? sum + cellSizes[index] : sum),
                1,
            );
            const options = createColumn({
                headCell: {
                    ...headCell,
                    enableSorting: headCell.enableSorting && rows.length > 1,
                    left,
                    width: columnWidth > 0 ? columnWidth : undefined,
                },
                footerCell,
                index: cellIndex,
                size,
                rows,
            });

            if (headCell.columns?.length) {
                const childDefaultWidth =
                    columnWidth > 0 ? columnWidth / headCell.columns?.length : 0;
                return columnHelper.group({
                    ...options,
                    columns: createHeadColumns(headCell.columns || [], childDefaultWidth),
                } as GroupColumnDef<TData>);
            } else {
                lastColumnIndex++;
            }

            return columnHelper.accessor((row) => {
                const cellData = row[cellIndex];

                return cellData.formattedValue ?? cellData.value;
            }, options as DisplayColumnDef<TData>);
        });
    };

    return createHeadColumns(head);
}

export function getTableTitle(config: TableWidgetData['config']): TableTitle | undefined {
    if (typeof config?.title === 'string') {
        return {text: config.title};
    }

    return config?.title;
}

export function getTableSizes(table: HTMLTableElement) {
    const tableScale = table?.getBoundingClientRect()?.width / table?.clientWidth;
    let rows: HTMLTableRowElement[] = [];

    rows = Array.from(
        table?.getElementsByTagName('thead')?.[0]?.childNodes ?? [],
    ) as HTMLTableRowElement[];

    if (!rows.length) {
        const tBodyRows = Array.from(
            table?.getElementsByTagName('tbody')?.[0]?.childNodes ?? [],
        ) as HTMLTableRowElement[];
        rows = tBodyRows.length ? [tBodyRows[0]] : [];
    }

    const colsCount = Array.from(rows[0]?.childNodes ?? []).reduce((sum, c) => {
        const colSpan = Number((c as Element).getAttribute('colSpan') || 1);
        return sum + colSpan;
    }, 0);
    const result = new Array(rows.length).fill(null).map(() => new Array(colsCount).fill(null));

    result.forEach((_r, rowIndex) => {
        const row = rows[rowIndex];
        let cellIndex = 0;
        Array.from(row.childNodes ?? []).forEach((c) => {
            const cell = c as Element;
            let rowSpan = Number(cell.getAttribute('rowSpan') || 1);
            let colSpan = Number(cell.getAttribute('colSpan') || 1);
            const cellWidth = cell.getBoundingClientRect()?.width / tableScale;

            if (result[rowIndex][cellIndex] !== null) {
                cellIndex = result[rowIndex].findIndex((val, i) => i > cellIndex && val === null);
            }

            while (rowSpan - 1 > 0) {
                rowSpan -= 1;
                result[rowIndex + rowSpan][cellIndex] = cellWidth;
            }

            if (colSpan > 1) {
                while (colSpan > 1) {
                    colSpan -= 1;
                    cellIndex += 1;
                }
            } else {
                result[rowIndex][cellIndex] = cellWidth;
            }

            cellIndex += 1;
        });
    });

    return result.reduce<number[]>((acc, row) => {
        row.forEach((cellWidth, index) => {
            if (cellWidth !== null) {
                acc[index] = acc[index] || cellWidth;
            }
        });
        return acc;
    }, []);
}
