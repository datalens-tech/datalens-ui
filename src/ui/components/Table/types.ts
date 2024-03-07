import React from 'react';

import {RowData} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        width?: string | number;
    }
}

interface CellData {
    value: unknown;
    formattedValue?: string;
    css?: React.CSSProperties;
}

export type RenderCellFn<T extends CellData> = (cellData: T) => React.ReactElement | null;

export type THead = {
    id: string;
    header?: string;
    enableSorting?: boolean;
    width?: string | number;
    renderCell?: RenderCellFn<CellData>;
};

export type TData = CellData[];

export type TFoot = CellData;

export type OnPaginationChange = (pageIndex: number) => void;
export type OnTableClick = (args: {row?: TData; cell?: CellData}) => void;

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
    pagination?: {
        enabled: boolean;
        pageIndex?: number;
        pageSize?: number;
        onChange?: OnPaginationChange;
    };
    header?: {
        sticky?: boolean;
    };
    onClick?: OnTableClick;
    qa?: {
        row?: string;
    };
};
