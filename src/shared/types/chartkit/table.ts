import type {Column} from '@gravity-ui/react-data-table';

import type {StringParams} from '../common';
import type {MarkupItem} from '../wizard';

import type {ChartKitCss} from './common';

type TableCellValue = MarkupItem | string | number | [number, number] | null;
type TableValuesRow = {
    values: TableCellValue[];
};
export type OnClickSetParams = {
    action: 'setParams';
    args: StringParams;
};

export type OnClickShowMessage = {
    action: 'showMsg';
    args: StringParams;
};

type TableCommonCellType = 'text' | 'date' | 'number' | 'diff' | 'diff_only' | 'markup' | 'bar';

// interface used because it is expanded in chartkit.d.ts
export interface TableCommonCell {
    value: TableCellValue;
    treeNode?: string;
    treeOffset?: number;
    treeNodeState?: 'open' | 'closed';
    drillDownFilterValue?: string;
    // formatted number from Wizard
    formattedValue?: string;
    css?: ChartKitCss;
    // if the column type: 'text'
    link?: {
        href: string;
        newWindow: boolean;
    };
    onClick?: OnClickSetParams | OnClickShowMessage;
    sortDirection?: 'asc' | 'desc' | null;
    type?: TableCommonCellType;
    fieldId?: string;
    /** Reserved subspace to store options and values for customized functionality */
    custom?: Record<string, any>;
}

export type BarTableCell = TableCommonCell & {
    barColor?: string;
    offset?: number;
    showBar?: boolean;
} & BarViewOptions;
export type TableCell = TableCommonCell | BarTableCell | string;
export type TableCellsRow = {
    cells: TableCell[];
};
export type TableRow = TableValuesRow | TableCellsRow;
export type CommonTableColumn = {
    id?: string;
    name: string;
    /** Formatted number from Wizard */
    formattedName?: string;
    type: TableCommonCellType;
    group?: boolean;
    autogroup?: boolean;
    markup?: MarkupItem;
    css?: ChartKitCss;
    width?: Column<unknown>['width'];
    /** @deprecated seems like only for type=grid */
    contentCss?: ChartKitCss;
    sortable?: boolean;
    allowGroupSort?: boolean;
    /** Reserved subspace to store options and values for customized functionality */
    custom?: Record<string, any>;
    pinned?: boolean;
};
export type TableColumnFormatter = {
    format?: 'number' | 'percent';
    suffix?: string;
    prefix?: string;
    multiplier?: number;
    precision?: number;
    showRankDelimiter?: boolean;
    unit?: 'auto' | 'k' | 'm' | 'b' | 't' | null;
};
export type NumberViewOptions = {
    view: 'number';
    formatter?: TableColumnFormatter;
    precision?: number;
};
export type BarViewOptions = {
    view: 'bar';
    barHeight?: string | number;
    min?: number;
    max?: number;
    align?: 'left' | 'right';
    showLabel?: boolean;
    showSeparator?: boolean;
    debug?: boolean;
};
export type NumberTableColumn = CommonTableColumn & {
    type: 'number';
} & (NumberViewOptions | BarViewOptions);
export type DateTableColumn = CommonTableColumn & {
    type: 'date';
    format?: string;
    /** @deprecated */
    scale?: 'd' | 'w' | 'm' | 'h' | 'i' | 's' | 'q' | 'y';
};
type TextTableColumn = CommonTableColumn & {
    type: 'text';
};
export type DiffTableColumn = CommonTableColumn &
    NumberViewOptions & {
        type: 'diff';
        diff_formatter?: TableColumnFormatter;
    };
type DiffOnlyTableColumn = CommonTableColumn &
    Omit<DiffTableColumn, 'type' | 'formatter'> & {
        type: 'diff_only';
    };
// type bar derpecated, the type remained only for the fallback.
// Now everything is described in NumberTableColumn
export type BarTableColumn = CommonTableColumn & {
    type: 'bar';
};
export type TableColumn =
    | NumberTableColumn
    | DateTableColumn
    | TextTableColumn
    | DiffTableColumn
    | DiffOnlyTableColumn
    | BarTableColumn;
type TableSubColumn = {
    id?: string;
    name: string;
    // formatted number from Wizard
    formattedName?: string;
    css?: ChartKitCss;
    markup: MarkupItem;
    sub: (TableColumn | TableSubColumn)[];
    width?: string;
    // A reserved subspace to store options and values for customized functionality.
    custom?: Record<string, any>;
};
export type TableHead = TableColumn | TableSubColumn;
export type TableTitle = {
    text: string;
    style?: ChartKitCss;
};
