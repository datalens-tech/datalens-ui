import React from 'react';

import {RowData} from '@tanstack/react-table';

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
}

export type RenderCellFn<T extends CellData> = (cellData: T) => React.ReactElement | null;

export type THead = {
    id: string;
    header?: string;
    enableSorting?: boolean;
    width?: string | number;
    renderCell?: RenderCellFn<CellData>;
    columns?: THead[];
};

export type TData = CellData[];

export type TFoot = CellData;

export type OnTableClick = (args: {row?: TData; cell?: CellData; event: React.MouseEvent}) => void;

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
    onClick?: OnTableClick;
    qa?: {
        header?: string;
        body?: string;
        footer?: string;
        row?: string;
        cell?: string;
    };
    manualSorting?: boolean;
    onSortingChange?: (args: {cell?: THead; sortOrder?: 'asc' | 'desc'}) => void;
};
