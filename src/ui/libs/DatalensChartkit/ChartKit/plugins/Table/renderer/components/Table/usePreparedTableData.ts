import React from 'react';

import type {ColumnDef, Row, SortingState, Table, TableOptions} from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {useVirtualizer} from '@tanstack/react-virtual';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import type {TableCell, TableCellsRow, TableCommonCell, TableHead} from 'shared';
import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';

import type {TableData, TableWidgetData} from '../../../../../../types';
import {camelCaseCss} from '../../../../../components/Widget/components/Table/utils';
import type {WidgetDimensions} from '../../types';
import {mapHeadCell} from '../../utils/renderer';

import type {
    BodyCellViewData,
    BodyRowViewData,
    FooterCellViewData,
    FooterRowViewData,
    HeadRowViewData,
    TData,
} from './types';
import {useCellSizes} from './useCellSizes';
import {createTableColumns} from './utils';

const PRERENDER_ROW_COUNT = 500;

type TableViewData = {
    colgroup?: {width: string}[];
    header: {
        rows: HeadRowViewData[];
        style?: React.CSSProperties;
    };
    body: {
        rows: BodyRowViewData[];
        style?: React.CSSProperties;
    };
    footer: {
        rows: FooterRowViewData[];
        style?: React.CSSProperties;
    };
    totalSize: number | undefined;
    /* rendering table without most options - only to calculate cells size */
    prerender: boolean;
};

function getNoDataRow(colSpan = 1): BodyRowViewData {
    return {
        id: '',
        index: 0,
        cells: [
            {
                id: '',
                index: 0,
                data: null,
                colSpan,
                content: i18n('chartkit-table', 'message-no-data'),
                style: {
                    background: 'var(--dl-table-no-data-bg-color)',
                },
            },
        ],
    };
}

function getFooterRows(table: Table<TData>) {
    return table.getFooterGroups().reduce<FooterRowViewData[]>((acc, f) => {
        const cells = f.headers.map<FooterCellViewData>((cell) => {
            const columnDef = cell.column.columnDef;
            const originalHeadData = columnDef.meta?.head;
            const originalFooterData = columnDef?.meta?.footer;
            const pinned = Boolean(originalHeadData?.pinned);
            const content = cell.isPlaceholder
                ? null
                : flexRender(columnDef.footer, cell.getContext());

            const cellStyle: React.CSSProperties = {
                left: pinned ? originalHeadData?.left : undefined,
            };

            return {
                id: cell.id,
                style: cellStyle,
                contentStyle: originalFooterData?.css ?? {},
                pinned,
                type: get(originalHeadData, 'type'),
                content,
            };
        });

        if (cells.some((c) => c.content)) {
            acc.push({
                id: f.id,
                cells,
            });
        }

        return acc;
    }, []);
}

function shouldGroupRow(currentRow: TData, prevRow: TData, cellIndex: number) {
    const current = currentRow.slice(0, cellIndex + 1).map((cell) => cell?.value ?? '');
    const prev = prevRow.slice(0, cellIndex + 1).map((cell) => cell?.value ?? '');

    return isEqual(prev, current);
}

export const usePreparedTableData = (props: {
    tableContainerRef: React.MutableRefObject<HTMLDivElement | null>;
    widgetData: TableWidgetData;
    dimensions: WidgetDimensions;
    data: Required<TableData>;
    manualSorting: boolean;
    onSortingChange?: (column: TableHead | undefined, sortOrder: 'asc' | 'desc') => void;
    getCellAdditionStyles?: (cell: TableCell, row: TData) => React.CSSProperties;
}): TableViewData => {
    const {
        widgetData: {config},
        dimensions,
        tableContainerRef,
        manualSorting,
        onSortingChange,
        data,
        getCellAdditionStyles,
    } = props;

    const cellSizes = useCellSizes(
        {
            tableContainerRef,
        },
        [dimensions.width, config],
    );
    const prerender = !cellSizes;

    const columns = React.useMemo(() => {
        const headData = data.head?.map((th) => mapHeadCell(th, dimensions.width));
        const footerData = ((data.footer?.[0] as TableCellsRow)?.cells || []).map((td) => {
            const cell = td as TableCommonCell;

            return {...cell, css: cell.css ? camelCaseCss(cell.css) : undefined};
        });
        return createTableColumns({head: headData, rows: data.rows, footer: footerData, cellSizes});
    }, [data, dimensions.width, cellSizes]);

    const [sorting, setSorting] = React.useState<SortingState>([]);

    const tableRowsData = React.useMemo(() => {
        return data.rows.map<TData>((r) => get(r, 'cells', []));
    }, [data.rows]);
    const table = useReactTable({
        data: tableRowsData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        sortDescFirst: true,
        manualSorting,
        manualPagination: true,
        state: {
            sorting,
        },
        onSortingChange: (updater) => {
            setSorting(updater);

            if (!manualSorting) {
                return;
            }

            const updates = typeof updater === 'function' ? updater(sorting) : updater;
            const {id, desc} = updates[0] || {};

            const findCell = (cols: ColumnDef<TData>[]): TableHead | undefined => {
                for (let i = 0; i < cols.length; i++) {
                    const col = cols[i];
                    if (col.id === id) {
                        return col.meta?.head as TableHead;
                    }

                    const subColumns = get(col, 'columns', []);
                    if (subColumns.length) {
                        const subCol = findCell(subColumns);
                        if (subCol) {
                            return subCol;
                        }
                    }
                }

                return undefined;
            };

            const headCellData = findCell(columns);
            const sortOrder = desc ? 'desc' : 'asc';

            if (onSortingChange) {
                onSortingChange(headCellData, sortOrder);
            }
        },
    } as TableOptions<TData>);

    const headers = table.getHeaderGroups();
    const tableRows = table.getRowModel().rows;

    const rowMeasures = React.useRef<Record<string, number>>({});
    React.useEffect(() => {
        rowMeasures.current = {};
    }, [data]);

    const rowVirtualizer = useVirtualizer({
        count: tableRows.length,
        estimateSize: () => 30,
        getScrollElement: () => tableContainerRef.current,
        measureElement: (el) => {
            const rowIndex = el.getAttribute('data-index') ?? '';
            if (rowIndex && typeof rowMeasures.current[rowIndex] === 'undefined') {
                const cells = Array.from(el?.getElementsByTagName('td') || []);
                const simpleCell = cells.find((c) => {
                    const rowSpan = Number(c.getAttribute('rowspan')) || 0;
                    return rowSpan <= 1;
                });
                rowMeasures.current[rowIndex] = simpleCell?.getBoundingClientRect()?.height ?? 0;
            }

            return rowMeasures.current[rowIndex];
        },
        overscan: 100,
    });

    const virtualItems = prerender
        ? new Array(Math.min(tableRows.length, PRERENDER_ROW_COUNT))
              .fill(null)
              .map((_, index) => ({index, start: 0, size: undefined}))
        : rowVirtualizer.getVirtualItems();

    const headerRows = headers
        .map((headerGroup) => {
            if (!headerGroup.headers.length) {
                return null;
            }

            const cells = headerGroup.headers
                .map((header, index) => {
                    if (header.column.depth !== headerGroup.depth) {
                        return null;
                    }

                    const originalCellData = header.column.columnDef.meta?.head;
                    const rowSpan = header.isPlaceholder
                        ? headers.length - headerGroup.depth
                        : undefined;
                    const colSpan = header.colSpan > 1 ? header.colSpan : undefined;
                    const sortable = header.column.getCanSort();
                    const pinned = Boolean(originalCellData?.pinned);
                    const cellStyle: React.CSSProperties = {
                        ...get(originalCellData, 'css', {}),
                        left: pinned ? originalCellData?.left : undefined,
                    };

                    const cellWidth = header.getSize();
                    if (prerender && cellWidth) {
                        cellStyle.width = cellWidth;
                    }

                    if (typeof originalCellData?.width !== 'undefined') {
                        cellStyle.whiteSpace = 'normal';
                        cellStyle.wordBreak = 'break-word';
                    }

                    return {
                        id: header.id,
                        index,
                        rowSpan,
                        colSpan,
                        sortable,
                        pinned,
                        style: cellStyle,
                        sorting: header.column.getIsSorted(),
                        content: flexRender(header.column.columnDef.header, header.getContext()),
                        onClick: header.column.getToggleSortingHandler(),
                    };
                })
                .filter(Boolean);

            return {
                id: headerGroup.id,
                cells,
            };
        })
        .filter(Boolean) as HeadRowViewData[];
    const colgroup = headers[headers.length - 1]?.headers.map((h) => ({width: `${h.getSize()}px`}));
    const gridTemplateColumns = colgroup.map((h) => h.width).join(' ');
    const header = prerender
        ? {rows: headerRows}
        : {
              rows: headerRows,
              style: {
                  gridTemplateColumns,
              },
          };

    const rows = React.useMemo(() => {
        if (!virtualItems.length) {
            const colSpan = headers[headers.length - 1]?.headers?.length;
            return [getNoDataRow(colSpan)];
        }

        const prevCells = new Array(tableRows[0]?.getVisibleCells()?.length);
        return virtualItems.reduce<BodyRowViewData[]>((rowsAcc, virtualRow) => {
            const row = tableRows[virtualRow.index] as Row<TData>;
            const visibleCells = row.getVisibleCells();
            const cells = visibleCells.reduce<BodyCellViewData[]>((acc, cell, index) => {
                const originalHeadData = cell.column.columnDef.meta?.head;
                const enableRowGrouping = get(originalHeadData, 'group', false);
                const originalCellData = cell.row.original[index] ?? {value: ''};
                const pinned = Boolean(originalHeadData?.pinned);

                if (enableRowGrouping && typeof prevCells[index] !== 'undefined') {
                    const prevCellRow = rowsAcc[prevCells[index]];
                    const prevCell = prevCellRow?.cells?.find((c) => c.index === index);
                    if (
                        typeof prevCell?.rowSpan !== 'undefined' &&
                        shouldGroupRow(
                            cell.row.original,
                            tableRows[prevCellRow?.index]?.original,
                            index,
                        )
                    ) {
                        prevCell.rowSpan += 1;
                        if (prevCell.maxHeight && virtualRow.size) {
                            prevCell.maxHeight += virtualRow.size;
                        }

                        return acc;
                    }
                }

                const additionalStyles = getCellAdditionStyles
                    ? getCellAdditionStyles(originalCellData as TableCell, row.original)
                    : {};
                const cellStyle: React.CSSProperties = {
                    left: pinned ? originalHeadData?.left : undefined,
                    ...additionalStyles,
                    ...camelCaseCss(originalCellData.css),
                };

                if (typeof originalHeadData?.width !== 'undefined') {
                    cellStyle.whiteSpace = 'normal';
                    cellStyle.wordBreak = 'break-word';
                } else if (prerender) {
                    cellStyle.whiteSpace = 'nowrap';
                }

                const contentStyle: React.CSSProperties = {};
                if (typeof originalHeadData?.width !== 'undefined') {
                    contentStyle.width = originalHeadData.width;
                }

                const renderCell =
                    typeof cell.column.columnDef.cell === 'function'
                        ? cell.column.columnDef.cell
                        : () => cell.column.columnDef.cell;

                const cellData: BodyCellViewData = {
                    id: cell.id,
                    index,
                    style: cellStyle,
                    contentStyle,
                    content: renderCell(cell.getContext()),
                    type: get(originalCellData, 'type', get(originalHeadData, 'type')),
                    contentType: originalCellData?.value === null ? 'null' : undefined,
                    pinned,
                    className:
                        typeof originalCellData?.className === 'function'
                            ? originalCellData?.className()
                            : originalCellData?.className,
                    rowSpan: 1,
                    data: originalCellData,
                    maxHeight: virtualRow.size,
                };

                prevCells[index] = rowsAcc.length;
                acc.push(cellData);
                return acc;
            }, []);

            rowsAcc.push({
                id: row.id,
                index: virtualRow.index,
                cells,
                ref: (node) => rowVirtualizer.measureElement(node),
                y: virtualRow.start,
            });

            return rowsAcc;
        }, []);
    }, [tableRows, virtualItems, getCellAdditionStyles, prerender, tableRowsData, rowVirtualizer]);

    const transform = typeof rows[0]?.y !== 'undefined' ? `translateY(${rows[0]?.y}px)` : undefined;
    const isEndOfPage = rows[rows.length - 1]?.index === tableRows.length - 1;
    const hasFooter = isEndOfPage && columns.some((column) => column.footer);
    const footer: TableViewData['footer'] = {
        rows: hasFooter ? getFooterRows(table) : [],
        style: {gridTemplateColumns, transform},
    };

    return {
        header,
        body: {
            rows,
            style: {gridTemplateColumns, transform},
        },
        footer,
        totalSize: prerender ? undefined : rowVirtualizer.getTotalSize(),
        prerender,
        colgroup: prerender ? undefined : colgroup,
    };
};
