import type {Column, ColumnDef} from '@tanstack/react-table';
import {createColumnHelper} from '@tanstack/react-table';

import type {TData, TFoot, THead} from './types';

function createColumn(args: {headCell: THead; footerCell?: TFoot; index: number}) {
    const {headCell, footerCell, index} = args;
    const {id, width, cell, ...columnOptions} = headCell;
    const options: ColumnDef<TData> = {
        ...columnOptions,
        id: `${id}__${index}`,
        meta: {
            width,
            footer: footerCell,
            head: headCell,
        },
    };

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

export function getTableColumns(args: {head?: THead[]; rows?: TData[]; footer?: TFoot[]}) {
    const {head = [], rows = [], footer = []} = args;
    const columnHelper = createColumnHelper<TData>();

    let lastColumnIndex = 0;
    const createHeadColumns = (cells: THead[]): ColumnDef<TData>[] => {
        return cells.map((headCell) => {
            const hasChildren = Boolean(headCell.columns?.length);
            const cellIndex = hasChildren ? -1 : lastColumnIndex;
            const footerCell = footer?.[cellIndex];
            const options: ColumnDef<TData> = createColumn({
                headCell: {...headCell, enableSorting: headCell.enableSorting && rows.length > 1},
                footerCell,
                index: cellIndex,
            });

            if (hasChildren) {
                return columnHelper.group({
                    ...options,
                    columns: createHeadColumns(headCell.columns || []),
                });
            } else {
                lastColumnIndex++;
            }

            return columnHelper.accessor((row) => {
                const cellData = row[cellIndex];

                return cellData.formattedValue ?? cellData.value;
            }, options);
        });
    };

    return createHeadColumns(head);
}

export function getTableData(args: {head?: THead[]; rows?: TData[]}) {
    const {head = [], rows = []} = args;
    const groupedCells = new Map();

    let cellIndex = 0;
    const setGrouping = (col: THead) => {
        if (col.columns?.length) {
            col.columns.forEach(setGrouping);
        } else {
            if (col.enableRowGrouping) {
                groupedCells.set(cellIndex, {rowIndex: -1});
            }
            cellIndex++;
        }
    };

    head.forEach(setGrouping);

    if (groupedCells.size) {
        return rows.map((row, rowIndex) => {
            return row.map((currentCell, index) => {
                if (groupedCells.has(index)) {
                    const prevCellData = groupedCells.get(index);
                    const prevCell = rows[prevCellData.rowIndex]?.[index];

                    if (prevCell && currentCell.value === prevCell?.value) {
                        prevCell.rowSpan = (prevCell.rowSpan || 1) + 1;
                        return {...currentCell, isVisible: false};
                    } else {
                        groupedCells.set(index, {rowIndex});
                    }
                }

                return currentCell;
            });
        });
    }

    return rows;
}

export function getColumnWidth(col: Column<TData> | undefined) {
    if (!col) {
        return undefined;
    }
    const currentCellWidth = col.columnDef.meta?.width;
    if (currentCellWidth) {
        return currentCellWidth;
    }

    const parentCellWidth = getColumnWidth(col.parent);
    if (parentCellWidth) {
        return parentCellWidth / col.parent?.columns.length;
    }

    return undefined;
}
