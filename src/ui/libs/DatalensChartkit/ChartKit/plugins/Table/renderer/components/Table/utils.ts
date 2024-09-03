import type {ColumnDef} from '@tanstack/react-table';
import {createColumnHelper} from '@tanstack/react-table';
import type {DisplayColumnDef, GroupColumnDef} from '@tanstack/table-core/build/lib/types';

import type {TData, TFoot, THead} from './types';

export function createColumn(args: {
    headCell: THead;
    footerCell?: TFoot;
    index: number;
    size?: number;
}) {
    const {headCell, footerCell, index, size} = args;
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
    rows?: unknown[];
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
                0,
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
