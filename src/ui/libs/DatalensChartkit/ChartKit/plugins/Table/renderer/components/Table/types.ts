import type React from 'react';

import type {SortDirection} from 'shared';

type HeadCellViewData = {
    id: string;
    rowSpan?: number;
    colSpan?: number;
    sortable: boolean;
    pinned: boolean;
    style?: React.CSSProperties;
    width: number;
    sorting: SortDirection | false;
    content: JSX.Element | React.ReactNode;
    onClick: () => void;
};

export type HeadRowViewData = {
    id: string;
    cells: HeadCellViewData[];
};

export type BodyCellViewData = {
    id: string;
    style?: React.CSSProperties;
    content: JSX.Element | React.ReactNode;
    className?: string;
    type?: 'number';
    pinned?: boolean;
    // onClick?: (event: MouseEvent) => void;
    rowSpan?: number;
    /* Index of cells in row (usefula with cell grouping) */
    index: number;
    /* Original cell data */
    data: unknown;
};

export type BodyRowViewData = {
    id: string;
    index: number;
    cells: BodyCellViewData[];
    ref?: (node: HTMLTableRowElement) => void;
    y: number;
};
