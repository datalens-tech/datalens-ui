import type {ColumnDef} from '@tanstack/react-table';
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
            return cell(context.row.getValue(context.column.id));
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

export function getTableColumns(args: {head?: THead[]; footer?: TFoot[]}) {
    const {head = [], footer = []} = args;
    const columnHelper = createColumnHelper<TData>();

    let lastColumnIndex = 0;
    const createHeadColumns = (cells: THead[]): ColumnDef<TData>[] => {
        return cells.map((headCell, index) => {
            const hasChildren = Boolean(headCell.columns?.length);
            const cellIndex = hasChildren ? -1 : lastColumnIndex;
            const footerCell = footer?.[cellIndex];
            const options: ColumnDef<TData> = createColumn({
                headCell,
                footerCell,
                index,
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
                if (headCell.cell) {
                    return cellData;
                }

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
