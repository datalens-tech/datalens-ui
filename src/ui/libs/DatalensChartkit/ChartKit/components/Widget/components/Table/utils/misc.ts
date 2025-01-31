import type React from 'react';

import {sanitizeUrl} from '@braintree/sanitize-url';
import type {Comparator, SortedDataItem} from '@gravity-ui/react-data-table';
import isEqual from 'lodash/isEqual';
import type {
    BarTableCell,
    BarViewOptions,
    ChartKitCss,
    NumberViewOptions,
    TableCell,
    TableCellsRow,
    TableCommonCell,
    TableHead,
    TableRow,
} from 'shared';
import {formatNumber} from 'shared/modules/format-units/formatUnit';

import type {DataTableData} from '../../../../../../types';

const decodeURISafe = (uri: string) => {
    return decodeURI(uri.replace(/%(?![0-9a-fA-F][0-9a-fA-F]+)/g, '%25'));
};

export const concatStrings = (...strs: string[]) => strs.filter(Boolean).join(' ');

export const encodeURISafe = (uri: string) => {
    if (!uri) {
        return uri;
    }

    return encodeURI(decodeURISafe(uri));
};

export const camelCaseCss = (rowStyle?: ChartKitCss) => {
    const style = typeof rowStyle !== 'object' || rowStyle === null ? {} : rowStyle;

    return Object.keys(style || {}).reduce((result, key) => {
        const camelCasedKey = key.replace(/-(\w|$)/g, (_dashChar, char) => char.toUpperCase());
        result[camelCasedKey] = (style as Record<string, string>)[key];
        return result;
    }, {} as any) as React.CSSProperties;
};

export const numberFormatter = (
    value: number | string,
    {
        precision: outerPrecision,
        formatter: {
            format = 'number',
            suffix = '',
            prefix = '',
            showRankDelimiter = true,
            multiplier = 1,
            precision: formatterPrecision,
            unit = null,
        } = {},
    }: NumberViewOptions,
) => {
    if (typeof value !== 'number') {
        return value;
    }

    let precision;

    if (typeof outerPrecision === 'number') {
        precision = outerPrecision;
    } else if (typeof formatterPrecision === 'number') {
        precision = formatterPrecision;
    }

    return formatNumber(value, {
        format,
        multiplier,
        precision,
        showRankDelimiter,
        unit,
        prefix,
        postfix: suffix,
        lang: 'ru',
    });
};

export const generateName = ({
    id = 'id',
    name = 'name',
    shift,
    level,
    index,
}: {
    id?: string;
    name?: string;
    shift: number;
    level: number;
    index: number;
}) => {
    return `${level}_${shift}_${index}_id=${id}_name=${name}`;
};

export const getIdFromGeneratedName = (generatedName: string | undefined): string => {
    if (!generatedName) {
        return '';
    }
    const matched = generatedName.match(/id=(.*)_name=/);
    return matched ? matched[1] : generatedName;
};

export const getCellOnClick = (row: DataTableData | undefined, columnName: string) => {
    const column = row && row[columnName];
    const onClick =
        typeof column === 'object' && column && 'onClick' in column ? column.onClick : undefined;

    return onClick;
};

export const hasGroups = (head: TableHead[] = []): boolean => {
    return head.some(
        (column) =>
            (column && 'group' in column && column.group) ||
            (column && 'sub' in column && column.sub && hasGroups(column.sub)),
    );
};

const percentsToNumber = (widthInPercent: string, totalWidth: number): number | undefined => {
    const percent = Number.parseFloat(widthInPercent);

    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
        return undefined;
    }

    return (totalWidth * percent) / 100;
};

const pixelsToNumber = (widthInPixels: string): number | undefined => {
    const width = Number.parseFloat(widthInPixels);

    return Number.isNaN(width) || width < 0 ? undefined : width;
};

export const getCellWidth = (
    userWidth?: string | number,
    tableWidth?: number,
): number | undefined => {
    let width: number | undefined;

    if (typeof userWidth === 'number' && userWidth >= 0) {
        width = userWidth;
    }

    if (typeof userWidth === 'string' && typeof tableWidth === 'number' && /%$/.test(userWidth)) {
        width = percentsToNumber(userWidth, tableWidth);
    }

    if (typeof userWidth === 'string' && /px$/.test(userWidth)) {
        width = pixelsToNumber(userWidth);
    }

    return width;
};

export const isCellValueNullable = (cell: TableCell) => {
    return typeof cell === 'object' && 'value' in cell && cell.value === null;
};

export const selectBarSettingValue = (
    options: BarViewOptions,
    cell: BarTableCell,
    setting: keyof Pick<BarViewOptions, 'showLabel' | 'showSeparator' | 'debug'>,
): boolean | undefined => {
    return typeof options[setting] === 'boolean' ? options[setting] : cell[setting];
};

export const prepareLinkHref = (href: string) => {
    let result: string;

    try {
        const url = new URL(href);
        // This is necessary to escaped special characters inside the query parameters
        // > const url = new URL('https://some.site/search/?text=x = 10')
        // > url.toString() // 'https://some.site/search/?text=x%20=%2010'
        // > url.searchParams.toString() // 'text=x+%3D+10'
        const params = url.searchParams.toString();
        result = sanitizeUrl(`${url.href.split('?')[0]}${params ? '?' : ''}${params}${url.hash}`);
    } catch {
        result = sanitizeUrl(encodeURISafe(href));
    }

    return result;
};

export const getCellTreeNode = (column: TableCell): string[] | null => {
    if (typeof column === 'object' && column.treeNode) {
        try {
            return JSON.parse(column.treeNode);
        } catch (e) {}
    }

    return null;
};

type Row = SortedDataItem<DataTableData>;

export const getParentRow = (row: Row, rows: TableRow[]): Row | null => {
    const treeNodeColName = Object.keys(row.row).find((colName) => {
        const cell = row.row[colName];

        if (typeof cell === 'object' && cell) {
            return getCellTreeNode(cell)?.length;
        }
        return false;
    });

    if (treeNodeColName) {
        const currentRowCell = row.row[treeNodeColName] as TableCommonCell;
        const parentTreeNode = getCellTreeNode(currentRowCell)?.slice(0, -1);

        const parentRowIndex = rows.findIndex((item) => {
            return (item as TableCellsRow).cells?.some((cell) =>
                isEqual(getCellTreeNode(cell), parentTreeNode),
            );
        });

        if (parentRowIndex !== -1) {
            return {
                index: parentRowIndex,
                row: (rows[parentRowIndex] as TableCellsRow).cells.reduce((acc, cell) => {
                    const name = Object.keys(row.row).find(
                        (key) =>
                            (row.row[key] as TableCommonCell).fieldId ===
                            (cell as TableCommonCell).fieldId,
                    );
                    return {...acc, [name!]: cell};
                }, {}),
            };
        }
    }

    return null;
};

export function hasTreeSetColumn(row: TableRow) {
    return (row as TableCellsRow)?.cells?.some((cell) => getCellTreeNode(cell));
}

export function getTreeSetColumnSortAscending(
    columnName: string,
    rows: TableRow[],
): Comparator<DataTableData> {
    return (row1, row2) => {
        const column1 = row1.row[columnName];
        const column2 = row2.row[columnName];

        let sortComparisonValue = 0;
        if (typeof column1 === 'object' && typeof column2 === 'object') {
            const treeSetColName = Object.keys(row1.row).find((colName) => {
                const col1 = row1.row[colName];
                return getCellTreeNode(col1)?.length;
            });

            if (treeSetColName) {
                const getComparisonRows = (r1?: Row | null, r2?: Row | null): [Row?, Row?] => {
                    if (!r1 || !r2) {
                        return [];
                    }

                    const tn1 = getCellTreeNode(r1.row[treeSetColName]) || [];
                    const tn2 = getCellTreeNode(r2.row[treeSetColName]) || [];
                    const key1 = tn1?.slice(0, -1).join('');
                    const key2 = tn2?.slice(0, -1).join('');

                    if (key1 === key2) {
                        return [r1, r2];
                    }

                    if (tn1.length === tn2.length) {
                        return getComparisonRows(getParentRow(r1, rows), getParentRow(r2, rows));
                    }

                    if (tn1.length > tn2.length) {
                        return getComparisonRows(getParentRow(r1, rows), r2);
                    }

                    return getComparisonRows(r1, getParentRow(r2, rows));
                };

                const [r1, r2] = getComparisonRows(row1, row2);

                if (r1 && r2) {
                    const c1 = r1.row[columnName] as TableCommonCell;
                    const c2 = r2.row[columnName] as TableCommonCell;

                    if (c1 !== c2) {
                        sortComparisonValue = (c1?.value || '') > (c2?.value || '') ? 1 : -1;
                    }
                }
            } else if (column1 !== column2) {
                sortComparisonValue = (column1?.value || '') > (column2?.value || '') ? 1 : -1;
            }
        }

        return sortComparisonValue;
    };
}
