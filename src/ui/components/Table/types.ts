import React from 'react';

import type {RowData, SortingFnOption} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        width?: string | number;
        footer?: {
            css?: React.CSSProperties;
        };
        head?: THead;
    }
}

interface CellData {
    value: unknown;
    formattedValue?: string;
    css?: React.CSSProperties;
    className?: string | (() => string);
    rowSpan?: number;
    isVisible?: boolean;
}

export type RenderCellFn<T extends CellData> = (cellData: T) => React.ReactElement | null;
export type RenderHeaderFn = () => React.ReactElement | null;

export type THead = {
    id: string;
    header?: string | RenderHeaderFn;
    enableSorting?: boolean;
    sortingFn?: SortingFnOption<TData>;
    enableRowGrouping?: boolean;
    pinned?: boolean;
    width?: string | number;
    cell?: RenderCellFn<CellData>;
    columns?: THead[];
};

export type TData = CellData[];

export type TFoot = CellData;

export type OnCellClickFn = (args: {row?: TData; cell?: CellData; event: React.MouseEvent}) => void;

export type TableProps = {
    title?: {text: string};
    data: {
        head?: THead[];
        rows?: TData[];
        footer?: TFoot[];
    };
    noData?: {
        text: string;
    };
    header?: {
        sticky?: boolean;
    };
    onCellClick?: OnCellClickFn;
    qa?: string;
    manualSorting?: boolean;
    onSortingChange?: (args: {cell?: THead; sortOrder?: 'asc' | 'desc'}) => void;
};

export type TableDimensions = {
    head: {width: number; top: number; left: number}[][];
    height: number;
    minWidth?: number;
    prevWidth?: number;
    width?: number;
};
