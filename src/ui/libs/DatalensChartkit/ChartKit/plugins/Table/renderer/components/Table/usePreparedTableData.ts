import React from 'react';

import type {ColumnDef, Row, SortingState, TableOptions} from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {useVirtualizer} from '@tanstack/react-virtual';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import type {TableCell, TableCellsRow, TableCommonCell, TableHead} from 'shared';
import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';
import {getRandomCKId} from 'ui/libs/DatalensChartkit/helpers/helpers';

import type {TableData} from '../../../../../../types';
import type {WidgetDimensions} from '../../types';
import {mapHeadCell} from '../../utils/renderer';

import {getCellsWidth} from './cell-width';
import type {
    BodyCellViewData,
    BodyRowViewData,
    FooterCellViewData,
    FooterRowViewData,
    HeadRowViewData,
    TData,
    TFoot,
    THead,
    TableViewData,
} from './types';
import {
    createTableColumns,
    getCellCustomStyle,
    getColumnId,
    getElementBackgroundColor,
    toSolidColor,
} from './utils';

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

function getFooterRows(args: {
    data: TableData;
    leftPositions: (number | undefined)[];
    bgColor?: string;
    columns: ColumnDef<TData>[];
}) {
    const {data, leftPositions, bgColor, columns} = args;
    const footerRows = (data.footer ?? []) as TableCellsRow[];

    return footerRows.reduce<FooterRowViewData[]>((acc, rowData, rowIndex) => {
        const cells = rowData.cells.map<FooterCellViewData>((footerCellData, cellIndex) => {
            const cellData = footerCellData as TableCommonCell;
            const col = findColumn(columns, (column) => get(column, 'index') === cellIndex);
            const originalHeadData = col?.meta?.head;
            const pinned = Boolean(originalHeadData?.pinned);
            let content = null;
            if (!get(cellData, 'isPlaceholder')) {
                const formattedValue = get(cellData, 'formattedValue', String(cellData.value));
                content = originalHeadData?.cell
                    ? originalHeadData?.cell(cellData)
                    : formattedValue;
            }

            const cellStyle: React.CSSProperties = {};
            if (pinned) {
                cellStyle.left = leftPositions[originalHeadData?.index ?? -1];
                cellStyle.backgroundColor = bgColor;
            }

            return {
                id: get(cellData, 'id', String(cellIndex)),
                style: cellStyle,
                contentStyle: getCellCustomStyle(cellData),
                pinned,
                type: get(originalHeadData, 'type'),
                content,
            };
        });

        if (cells.some((c) => c.content)) {
            acc.push({
                id: String(rowIndex),
                cells,
            });
        }

        return acc;
    }, []);
}

function shouldGroupRow(args: {
    currentRow: TData;
    prevRow: TData;
    cellIndex: number;
    startIndex?: number;
}) {
    const {currentRow, prevRow, cellIndex, startIndex = 0} = args;
    const current = currentRow.slice(startIndex, cellIndex + 1).map((cell) => cell?.value ?? '');
    const prev = prevRow.slice(startIndex, cellIndex + 1).map((cell) => cell?.value ?? '');

    return isEqual(prev, current);
}

function findColumn(
    cols: ColumnDef<TData>[],
    predicate: (col: ColumnDef<TData>) => boolean,
): ColumnDef<TData> | undefined {
    for (let i = 0; i < cols.length; i++) {
        const col = cols[i];
        if (predicate(col)) {
            return col;
        }

        const subColumns = get(col, 'columns', []);
        if (subColumns.length) {
            const subCol = findColumn(subColumns, predicate);
            if (subCol) {
                return subCol;
            }
        }
    }

    return undefined;
}

function findCell(
    cols: ColumnDef<TData>[],
    predicate: (col: ColumnDef<TData>) => boolean,
): THead | undefined {
    const col = findColumn(cols, predicate);
    return col?.meta?.head;
}

export const usePreparedTableData = (props: {
    tableContainerRef: React.MutableRefObject<HTMLDivElement | null>;
    dimensions: WidgetDimensions;
    data: Required<TableData>;
    manualSorting: boolean;
    onSortingChange?: (column: TableHead | undefined, sortOrder: 'asc' | 'desc') => void;
    getCellAdditionStyles?: (cell: TableCell, row: TData) => React.CSSProperties;
    cellMinSizes: number[] | null;
    sortingState?: SortingState;
    backgroundColor?: string;
    preserveWhiteSpace?: boolean;
}): TableViewData => {
    const {
        dimensions,
        tableContainerRef,
        manualSorting,
        onSortingChange,
        data,
        getCellAdditionStyles,
        cellMinSizes,
        sortingState,
        backgroundColor,
        preserveWhiteSpace,
    } = props;
    const [shouldResize, resize] = React.useState<string | null>(null);

    const onRenderCell = React.useCallback(
        debounce(() => {
            resize(getRandomCKId());
        }),
        [],
    );

    const columns = React.useMemo(() => {
        const headData = data.head?.map((th) =>
            mapHeadCell({th, tableWidth: dimensions.width, onRenderCell}),
        );
        const footerData = ((data.footer?.[0] as TableCellsRow)?.cells ?? []) as TFoot[];
        return createTableColumns({head: headData, rows: data.rows, footer: footerData});
    }, [data, dimensions.width]);

    const initialSortingState = React.useMemo(() => {
        return (sortingState ?? []).reduce<SortingState>((acc, s) => {
            const thead = findCell(columns, (col) => col.meta?.head?.id === s.id);
            if (thead) {
                acc.push({
                    id: getColumnId(thead),
                    desc: s.desc,
                });
            }
            return acc;
        }, []);
    }, [columns, sortingState]);
    const [sorting, setSorting] = React.useState<SortingState>(initialSortingState);

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
        isMultiSortEvent: (event: React.MouseEvent<HTMLElement, MouseEvent>) =>
            event.ctrlKey || event.metaKey,
        onSortingChange: (updater) => {
            setSorting(updater);

            if (!manualSorting) {
                return;
            }

            const updates = typeof updater === 'function' ? updater(sorting) : updater;
            const {id, desc} = updates[0] || {};
            const headCellData = findCell(columns, (col) => col.id === id) as TableHead;
            const sortOrder = desc ? 'desc' : 'asc';

            if (onSortingChange) {
                onSortingChange(headCellData, sortOrder);
            }
        },
    } as TableOptions<TData>);

    const headers = table.getHeaderGroups();
    const tableRows = table.getRowModel().rows;

    const rowMeasures = React.useMemo<Record<string, number>>(() => {
        return {};
    }, [data, dimensions, cellMinSizes, shouldResize]);

    const rowVirtualizer = useVirtualizer({
        count: tableRows.length,
        estimateSize: () => {
            return 60;
        },
        getScrollElement: () => tableContainerRef.current,
        measureElement: (el) => {
            const rowIndex = Number(el.getAttribute('data-index')) ?? -1;
            const row = tableRows[rowIndex] as Row<TData>;
            const rowId = row?.id ?? -1;

            const getRowHeight = () => {
                const cells = Array.from(el?.getElementsByTagName('td') || []);
                const simpleCell = cells.find((c) => {
                    const rowSpan = Number(c.getAttribute('rowspan')) || 0;
                    return rowSpan <= 1;
                });

                return simpleCell?.getBoundingClientRect()?.height ?? 0;
            };

            if (rowId && typeof rowMeasures[rowId] === 'undefined') {
                rowMeasures[rowId] = getRowHeight();
            }

            return rowMeasures[rowId];
        },
        overscan: 100,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    const cols = (headers[headers.length - 1]?.headers ?? []).map<{min: number; fixed?: number}>(
        (h) => {
            const min = cellMinSizes?.[h.index] ?? 0;
            const fixedWidth = h.column.columnDef.meta?.width;
            return {min, fixed: fixedWidth ? Number(fixedWidth) : undefined};
        },
    );

    const colSizeRef = React.useRef<number[]>();
    const tableMinWidth = tableContainerRef.current?.clientWidth ?? 0;
    const colSizes = React.useMemo(() => {
        const result = getCellsWidth({
            cols,
            tableMinWidth,
        });

        if (!isEqual(result, colSizeRef.current)) {
            colSizeRef.current = result;
        }

        return colSizeRef.current ?? [];
    }, [cols, tableMinWidth]);

    const leftPositionsRef = React.useRef<(number | undefined)[]>([]);
    const leftPositions = React.useMemo(() => {
        const newValue = (headers[headers.length - 1]?.headers ?? []).map<number | undefined>(
            (h) => {
                const headData = h.column.columnDef.meta?.head;
                if (!headData?.pinned) {
                    return undefined;
                }

                const cellIndex = headData?.index ?? -1;
                return colSizes.reduce(
                    (sum, _s, i) => (i < cellIndex ? sum + colSizes[i] : sum),
                    1,
                );
            },
        );

        if (!isEqual(newValue, leftPositionsRef.current)) {
            leftPositionsRef.current = newValue;
        }

        return leftPositionsRef.current;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colSizes, data.head]);

    const tableBgColor = backgroundColor
        ? toSolidColor(backgroundColor)
        : getElementBackgroundColor(tableContainerRef.current);

    const whiteSpace = preserveWhiteSpace ? 'pre-wrap' : 'normal';

    const headerRows = React.useMemo(() => {
        return headers
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
                        const cellStyle: React.CSSProperties = getCellCustomStyle(
                            originalCellData,
                            tableBgColor,
                        );

                        if (pinned) {
                            cellStyle.left = leftPositions[originalCellData?.index ?? -1];

                            if (!cellStyle.backgroundColor) {
                                cellStyle.backgroundColor = tableBgColor;
                            }
                        }

                        if (typeof originalCellData?.width !== 'undefined') {
                            cellStyle.whiteSpace = cellStyle.whiteSpace ?? whiteSpace;
                            cellStyle.wordBreak = cellStyle.wordBreak ?? 'break-word';
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
                            content: flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                            ),
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns, leftPositions, sorting, tableBgColor]);

    const colgroup = colSizes.map((size) => ({width: `${size}px`}));
    const gridTemplateColumns = colgroup.map((h) => h.width).join(' ');
    const header = {
        rows: headerRows,
        style: {
            gridTemplateColumns,
            backgroundColor: tableBgColor,
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
            const rowMeasuredHeight = rowMeasures[row.id];
            const visibleCells = row.getVisibleCells();
            let groupingStartIndex = 0;
            const cells = visibleCells.reduce<BodyCellViewData[]>((acc, cell, index) => {
                const originalHeadData = cell.column.columnDef.meta?.head;
                const enableRowGrouping = get(originalHeadData, 'group', false);
                const originalCellData = cell.row.original[index] ?? {value: ''};
                const pinned = Boolean(originalHeadData?.pinned);

                if (enableRowGrouping) {
                    if (typeof prevCells[index] !== 'undefined') {
                        const prevCellRow = rowsAcc[prevCells[index]];
                        const prevCell = prevCellRow?.cells?.find((c) => c.index === index);
                        if (
                            typeof prevCell?.rowSpan !== 'undefined' &&
                            shouldGroupRow({
                                currentRow: cell.row.original,
                                prevRow: tableRows[prevCellRow?.index]?.original,
                                cellIndex: index,
                                startIndex: groupingStartIndex,
                            })
                        ) {
                            prevCell.rowSpan += 1;
                            if (prevCell.maxHeight && rowMeasuredHeight) {
                                prevCell.maxHeight += rowMeasuredHeight;
                            }

                            return acc;
                        }
                    }
                } else {
                    groupingStartIndex = index + 1;
                }

                const additionalStyles = getCellAdditionStyles
                    ? getCellAdditionStyles(originalCellData as TableCell, row.original)
                    : {};

                const cellStyle: React.CSSProperties = {
                    ...getCellCustomStyle(originalCellData, tableBgColor),
                    ...additionalStyles,
                };

                if (pinned) {
                    cellStyle.left = leftPositions[originalHeadData?.index ?? -1];

                    if (!cellStyle.backgroundColor) {
                        cellStyle.backgroundColor = tableBgColor;
                    }
                }

                if (typeof originalHeadData?.width !== 'undefined') {
                    cellStyle.whiteSpace = whiteSpace;
                    cellStyle.wordBreak = 'break-word';
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
                    maxHeight:
                        enableRowGrouping && rowMeasuredHeight ? rowMeasuredHeight : undefined,
                };

                prevCells[index] = rowsAcc.length;
                acc.push(cellData);
                return acc;
            }, []);

            rowsAcc.push({
                id: row.id,
                index: virtualRow.index,
                cells,
                y: virtualRow.start,
            });

            return rowsAcc;
        }, []);
    }, [tableRows, virtualItems, getCellAdditionStyles, tableRowsData, rowVirtualizer]);

    const transform = typeof rows[0]?.y !== 'undefined' ? `translateY(${rows[0]?.y}px)` : undefined;
    const isEndOfPage = rows[rows.length - 1]?.index === tableRows.length - 1;
    const hasFooter = isEndOfPage && data.footer?.length > 0;
    const footer: TableViewData['footer'] = {
        rows: hasFooter ? getFooterRows({data, columns, leftPositions, bgColor: tableBgColor}) : [],
        style: {gridTemplateColumns, transform},
    };

    return {
        header,
        body: {
            rows,
            style: {gridTemplateColumns, transform},
            rowRef: (node) => {
                rowVirtualizer.measureElement(node);
            },
        },
        footer,
        totalSize: rowVirtualizer.getTotalSize(),
        colgroup,
    };
};
