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
    const createHeadColumns = (cells: THead[]): ColumnDef<TData>[] => {
        return cells.map((headCell) => {
            const hasChildren = Boolean(headCell.columns?.length);
            const cellIndex = hasChildren ? -1 : lastColumnIndex;
            const footerCell = footer?.[cellIndex];
            const size =
                cellSizes[cellIndex] ??
                (typeof headCell.width === 'number' ? Number(headCell.width) : 0);
            const left = cellSizes.reduce(
                (sum, _s, index) => (index < cellIndex ? sum + cellSizes[index] : sum),
                0,
            );
            const options = createColumn({
                headCell: {
                    ...headCell,
                    enableSorting: headCell.enableSorting && rows.length > 1,
                    left,
                },
                footerCell,
                index: cellIndex,
                size,
            });

            if (hasChildren) {
                return columnHelper.group({
                    ...options,
                    columns: createHeadColumns(headCell.columns || []),
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
