import type * as React from 'react';

import type {DateTimeInput} from '@gravity-ui/date-utils';
import {dateTimeUtc} from '@gravity-ui/date-utils';
import type {
    ColumnDef,
    DisplayColumnDef,
    GroupColumnDef,
    SortingFnOption,
} from '@tanstack/react-table';
import {createColumnHelper} from '@tanstack/react-table';
import {ascending, rgb} from 'd3';
import type {Primitive, RGBColor} from 'd3';
import get from 'lodash/get';
import round from 'lodash/round';
import {
    type TableCellsRow,
    type TableCommonCell,
    type TableRow,
    type TableTitle,
    isMarkupItem,
} from 'shared';

import {markupToRawString} from '../../../../../../modules/table';
import type {TableWidgetData} from '../../../../../../types';
import {camelCaseCss} from '../../../../../components/Widget/components/Table/utils';
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

            // Intentionally set incorrect input for null cell values, because `new Date(null)`
            // gives the correct date, but we do not want this to preserve the old sorting behavior.
            const date1 = dateTimeUtc({input: cell1Value === null ? 'invalid' : cell1Value});
            const date2 = dateTimeUtc({input: cell2Value === null ? 'invalid' : cell2Value});

            if (date1 > date2 || (date1.isValid() && !date2.isValid())) {
                return 1;
            }

            if (date2 > date1 || (date2.isValid() && !date1.isValid())) {
                return -1;
            }

            return 0;
        };
    }

    return function (row1, row2) {
        const nullReplacement = columnType === 'number' ? -Infinity : '';
        const a = getSortAccessor(row1.original[columnIndex].value, nullReplacement);
        const b = getSortAccessor(row2.original[columnIndex].value, nullReplacement);

        return ascending(a as Primitive, b as Primitive);
    };
}

function getSortAccessor(value: unknown, nullReplacement?: Primitive) {
    if (isMarkupItem(value)) {
        return markupToRawString(value);
    }

    if (value === null && typeof nullReplacement !== 'undefined') {
        return nullReplacement;
    }

    return value as Primitive;
}

export function getColumnId(headCell: THead) {
    return `${headCell.id}__${headCell.index}`;
}

function createColumn(args: {
    headCell: THead;
    rows?: TableRow[];
    footerCell?: TFoot;
    index: number;
    size?: number;
}) {
    const {headCell, footerCell, index, size, rows} = args;
    const {width, cell, ...columnOptions} = headCell;
    const options = {
        ...columnOptions,
        id: getColumnId(headCell),
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

    return options;
}

export function createTableColumns(args: {head?: THead[]; rows?: TableRow[]; footer?: TFoot[]}) {
    const {head = [], rows = [], footer = []} = args;
    const columnHelper = createColumnHelper<TData>();

    let lastColumnIndex = 0;
    const createHeadColumns = (cells: THead[], defaultWidth = 0): ColumnDef<TData>[] => {
        return cells.map((headCell) => {
            const cellIndex = headCell.columns?.length ? -1 : lastColumnIndex;
            const footerCell = footer?.[cellIndex];
            const columnWidth =
                typeof headCell.width === 'number' ? Number(headCell.width) : defaultWidth;
            const options = createColumn({
                headCell: {
                    ...headCell,
                    enableSorting: headCell.enableSorting && rows.length > 1,
                    width: columnWidth > 0 ? columnWidth : undefined,
                    index: cellIndex,
                },
                footerCell,
                index: cellIndex,
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
    const tableScale = round(table?.getBoundingClientRect()?.width / table?.clientWidth, 2);
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

export function toSolidColor(current: string | RGBColor, background?: RGBColor) {
    const bg = background ?? rgb(getPageBgColor());
    const color = typeof current === 'string' ? rgb(varToColor(current)) : current;

    return color
        .copy({
            r: (1 - color.opacity) * bg.r + color.opacity * color.r,
            g: (1 - color.opacity) * bg.g + color.opacity * color.g,
            b: (1 - color.opacity) * bg.b + color.opacity * color.b,
            opacity: 1,
        })
        .formatRgb();
}

function varToColor(value: string) {
    if (value.startsWith('var(')) {
        const bodyStyles = window.getComputedStyle(document.body);
        return bodyStyles.getPropertyValue(value.slice(4, -1));
    }

    return value;
}

function getPageBgColor() {
    return window.getComputedStyle(document.body).getPropertyValue('background-color');
}

export function getElementBackgroundColor(el?: HTMLElement | null): string {
    if (!el) {
        return getPageBgColor();
    }

    const color = window.getComputedStyle(el).getPropertyValue('background-color');
    const rgbColor = rgb(color);

    if (el.tagName !== 'BODY') {
        if (!rgbColor.opacity) {
            return getElementBackgroundColor(el.parentElement);
        }

        if (rgbColor.opacity < 1) {
            return toSolidColor(rgbColor, rgb(getPageBgColor()));
        }
    }

    return rgbColor.toString();
}

export function getCellCustomStyle(cellData: unknown, tableBgColor?: string) {
    const css = {...camelCaseCss(get(cellData, 'css', {}))} as React.CSSProperties;

    // Since the table is created with flex/grid instead of standard table layout,
    // some of styles will not work as expected - we replace them here
    if (css.verticalAlign && !css.alignItems) {
        switch (css.verticalAlign) {
            case 'middle': {
                css.alignItems = 'center';
                break;
            }
            case 'bottom': {
                css.alignItems = 'end';
                break;
            }
        }
    }

    if (css.textAlign && !css.justifyContent) {
        switch (css.textAlign) {
            case 'left': {
                css.justifyContent = 'flex-start';
                break;
            }
            case 'center': {
                css.justifyContent = 'center';
                break;
            }
            case 'right': {
                css.justifyContent = 'flex-end';
                break;
            }
        }
    }

    if (css.backgroundColor && tableBgColor) {
        css.backgroundColor = varToColor(String(css.backgroundColor));
        const rgbColor = rgb(css.backgroundColor as string);
        if (rgbColor.opacity < 1) {
            // Due to special cases like sticky row/column,
            // we cannot use cell background with alpha chanel - the content begins to "shine through"
            css.backgroundColor = toSolidColor(rgbColor, rgb(tableBgColor));
        }
    }

    return css;
}
