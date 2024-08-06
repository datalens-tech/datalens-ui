import type {MutableRefObject} from 'react';
import React from 'react';

import type {ColumnDef, Row, SortingState, TableOptions} from '@tanstack/react-table';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {useVirtualizer} from '@tanstack/react-virtual';
import type {DisplayColumnDef, GroupColumnDef} from '@tanstack/table-core/build/lib/types';
import block from 'bem-cn-lite';
import get from 'lodash/get';

import type {SortDirection, StringParams, TableCellsRow, TableCommonCell} from 'shared';
import {SortIcon} from 'ui/components/Table/components/SortIcon/SortIcon';
import type {TData, TFoot, THead} from 'ui/components/Table/types';
import type {WidgetDimensions} from 'ui/libs/DatalensChartkit/ChartKit/plugins/Table/renderer/types';
import type {TableWidgetData} from 'ui/libs/DatalensChartkit/types';

import Paginator from '../../../../../components/Widget/components/Table/Paginator/Paginator';
import {camelCaseCss, hasGroups} from '../../../../../components/Widget/components/Table/utils';
import {SNAPTER_HTML_CLASSNAME} from '../../../../../components/Widget/components/constants';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../../../helpers/constants';
import {
    getCellActionParams,
    getCellCss,
    getCurrentActionParams,
    getUpdatesTreeState,
    mapTableData,
} from '../../utils';
import {getDrillDownOptions} from '../../utils/drill-down';
import {mapHeadCell} from '../../utils/renderer';
import {TableTitle} from '../Title/TableTitle';

import './Table.scss';

import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';

// Todo:
//  4) сводная шапка
//  2) chart-chart фильтрация

const b = block('dl-table');

type Props = {
    widgetData: TableWidgetData;
    dimensions: WidgetDimensions;
    onChangeParams?: (params: StringParams) => void;
};

const useCellSizes = (args: {
    tableContainerRef?: MutableRefObject<HTMLDivElement | null>;
    width: number;
    config: TableWidgetData['config'];
}) => {
    const {tableContainerRef, width, config} = args;
    const [cellSizes, setCellSizes] = React.useState<number[] | null>(null);

    React.useLayoutEffect(() => {
        if (!cellSizes) {
            const container = tableContainerRef?.current as Element;
            const table = container?.getElementsByTagName('table')?.[0];
            const tBody = table?.getElementsByTagName('tbody')?.[0];
            const tRow = tBody?.getElementsByTagName('tr')?.[0];
            const tCells = tRow?.getElementsByTagName('td') ?? [];

            const result = Array.from(tCells).map((tCell) => {
                return tCell.getBoundingClientRect()?.width;
            });

            setCellSizes(result);
        }
    }, [cellSizes, tableContainerRef]);

    React.useEffect(() => {
        if (cellSizes) {
            setCellSizes(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, config]);

    return cellSizes;
};

function createColumn(args: {headCell: THead; footerCell?: TFoot; index: number; size?: number}) {
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

function createTableColumns(args: {
    head?: THead[];
    rows?: unknown[];
    footer?: TFoot[];
    cellSizes?: null | number[];
}) {
    const {head = [], rows = [], footer = [], cellSizes} = args;
    const columnHelper = createColumnHelper<TData>();

    let lastColumnIndex = 0;
    const createHeadColumns = (cells: THead[]): ColumnDef<TData>[] => {
        return cells.map((headCell) => {
            const hasChildren = Boolean(headCell.columns?.length);
            const cellIndex = hasChildren ? -1 : lastColumnIndex;
            const footerCell = footer?.[cellIndex];
            const cellSize =
                cellSizes?.[cellIndex] ??
                (typeof headCell.width === 'number' ? Number(headCell.width) : 0);
            const left = (cellSizes || []).reduce(
                (sum, s, index) => (index < cellIndex ? sum + cellSizes?.[index] : sum),
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
                size: cellSize,
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

type HeadRowViewData = {
    id: string;
    cells: HeadCellViewData[];
};

type BodyCellViewData = {
    id: string;
    style?: React.CSSProperties;
    content: JSX.Element | React.ReactNode;
    className?: string;
    type?: 'number';
    pinned?: boolean;
    onClick?: (event: MouseEvent) => void;
    rowSpan?: number;
    index: number;
};

type BodyRowViewData = {
    id: string;
    index: number;
    cells: BodyCellViewData[];
    ref?: (node: HTMLTableRowElement) => void;
    y: number;
};

type TableViewData = {
    title?: string;
    header: {
        rows: HeadRowViewData[];
        style?: React.CSSProperties;
    };
    rows: BodyRowViewData[];
    settings: {
        highlightRows: boolean;
        sticky: boolean;
    };
    pagination: {
        enabled: boolean;
        currentPage: number;
        rowsCount: number;
        pageLimit: number;
        onChange: (args: any) => void;
    };
    height: number | null;
    totalSize: number | null;
    renderedItemsSize: number | null;
    /* rendering table without most options - only to calculate cells size */
    prerender: boolean;
};

const usePreparedTableData = (
    props: Props & {tableContainerRef: MutableRefObject<HTMLDivElement | null>},
): TableViewData => {
    const {
        widgetData: {config, data: originalData, params: currentParams, unresolvedParams},
        dimensions,
        tableContainerRef,
        onChangeParams,
    } = props;
    const actionParams = getCurrentActionParams({config, unresolvedParams});

    const data = React.useMemo(() => mapTableData(originalData), [originalData]);
    const shouldHighlightRows = get(config, 'settings.highlightRows') ?? !hasGroups(data.head);

    const {enabled: canDrillDown} = getDrillDownOptions({
        params: currentParams,
        config: config?.drillDown,
    });
    const rowData = React.useMemo(() => {
        const rows = (data.rows || []) as TableCellsRow[];
        return rows.map<TData>((r) => {
            return r.cells.map((c) => {
                const cell = c as TableCommonCell;
                const isCellClickable =
                    Boolean(canDrillDown && cell.drillDownFilterValue) ||
                    Boolean(cell.treeNode) ||
                    Boolean(cell.onClick) ||
                    Boolean(actionParams?.scope);
                const cursor = isCellClickable ? 'pointer' : undefined;
                const actionParamsCss = getCellCss({
                    actionParamsData: actionParams,
                    row: r,
                    cell: c,
                    head: data.head,
                    rows: data.rows || [],
                });

                // const column = data.head?.[cellIndex];
                // const cellType = cell.type ?? get(column, 'type');
                // let cellClassName: string | undefined;
                // if (cellType === 'number') {
                //     cellClassName = b('number-column');
                // }

                return {
                    ...cell,
                    css: {cursor, ...actionParamsCss, ...camelCaseCss(cell.css)},
                    // className: cellClassName,
                };
            });
        });
    }, [actionParams, canDrillDown, data.head, data.rows]);

    // calculate cell widths
    const cellSizes = useCellSizes({
        tableContainerRef,
        width: dimensions.width,
        config,
    });
    const prerender = !cellSizes;

    const columns = React.useMemo(() => {
        const headData = data.head?.map((th) => mapHeadCell(th, dimensions.width, data.head));
        const footerData = ((data.footer?.[0] as TableCellsRow)?.cells || []).map((td) => {
            const cell = td as TableCommonCell;

            return {...cell, css: cell.css ? camelCaseCss(cell.css) : undefined};
        });
        return createTableColumns({head: headData, rows: data.rows, footer: footerData, cellSizes});
    }, [data, dimensions.width, cellSizes]);

    const [sorting, setSorting] = React.useState<SortingState>([]);

    const changeParams = React.useCallback(
        (values: StringParams | null) => {
            if (onChangeParams && values) {
                onChangeParams(values);
            }
        },
        [onChangeParams],
    );

    const isPaginationEnabled = Boolean(config?.paginator?.enabled);
    const table = useReactTable({
        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        sortDescFirst: true,
        manualSorting: isPaginationEnabled,
        manualPagination: true,
        state: {
            sorting,
        },
        onSortingChange: (updater) => {
            setSorting(updater);

            const updates = typeof updater === 'function' ? updater(sorting) : updater;
            const {id, desc} = updates[0] || {};
            const headCellData = columns.find((c) => c.id === id)?.meta?.head;
            const sortOrder = desc ? 'desc' : 'asc';
            const sortParams: Record<string, string> = {
                _columnId: '',
                _sortOrder: '',
                _sortColumnMeta: JSON.stringify(headCellData?.custom || {}),
            };

            if (headCellData) {
                const columnId = headCellData.fieldId ?? headCellData.id;
                sortParams._columnId = `_id=${columnId}_name=${headCellData.name}`;
                sortParams._sortOrder = String(sortOrder === 'desc' ? -1 : 1);
            }

            changeParams(sortParams);
        },
    } as TableOptions<TData>);

    const headers = table.getHeaderGroups();
    const tableRows = table.getRowModel().rows;

    const rowVirtualizer = useVirtualizer({
        count: tableRows.length,
        estimateSize: () => 30,
        getScrollElement: () => tableContainerRef.current,
        measureElement: (el) => {
            const cells = Array.from(el?.getElementsByTagName('td') || []);
            const simpleCell = cells.find((c) => {
                const rowSpan = Number(c.getAttribute('rowspan')) || 0;
                return rowSpan <= 1;
            });
            const height = simpleCell?.getBoundingClientRect()?.height;
            // console.log('measureElement', {height});
            return height ?? 0;
        },
        overscan: 20,
    });

    const PRERENDER_ROW_COUNT = 500;
    const virtualItems = prerender
        ? new Array(Math.min(tableRows.length, PRERENDER_ROW_COUNT))
              .fill(null)
              .map((_, index) => ({index, start: 0}))
        : rowVirtualizer.getVirtualItems();

    const headerRows = headers
        .map((headerGroup, rowIndex) => {
            if (!headerGroup.headers.length) {
                return null;
            }

            const cells = headerGroup.headers
                .map((header, index) => {
                    if (header.column.depth !== headerGroup.depth) {
                        return null;
                    }

                    const originalCellData = header.column.columnDef.meta?.head;
                    // const width = getColumnWidth(header.column);
                    // const isFixedSize = Boolean(width);
                    const rowSpan = header.isPlaceholder
                        ? headers.length - headerGroup.depth
                        : undefined;
                    const colSpan = header.colSpan > 1 ? header.colSpan : undefined;
                    // const align = colSpan ? 'center' : 'left';
                    const sortable = header.column.getCanSort();
                    const pinned = Boolean(originalCellData?.pinned);
                    // const nextCellData =
                    //     rowCells[index + 1]?.column.columnDef.meta?.head;
                    // const isLastPinnedCell =
                    //     pinned && !nextCellData?.pinned;
                    // const cellDimensions =
                    //     tableDimensions?.head[rowIndex]?.[index];
                    const cellStyle: React.CSSProperties = {
                        left: pinned ? originalCellData?.left : undefined,
                    };

                    const cellWidth = header.getSize();
                    if (cellWidth) {
                        cellStyle.width = cellWidth;
                    }

                    if (typeof originalCellData.width !== 'undefined') {
                        cellStyle.whiteSpace = 'normal';
                        cellStyle.wordBreak = 'break-word';
                    } else if (prerender) {
                        cellStyle.whiteSpace = 'nowrap';
                    }

                    if (rowIndex > 0) {
                        cellStyle.borderTop = 0;
                    }

                    return {
                        id: header.id,
                        rowSpan,
                        colSpan,
                        sortable,
                        pinned,
                        style: cellStyle,
                        sorting: header.column.getIsSorted(),
                        content: flexRender(header.column.columnDef.header, header.getContext()),
                        onClick: header.column.getToggleSortingHandler(),
                        width: cellWidth,
                    };
                })
                .filter(Boolean);

            return {
                id: headerGroup.id,
                cells,
            };
        })
        .filter(Boolean) as HeadRowViewData[];
    const header = prerender
        ? {rows: headerRows}
        : {
              rows: [
                  {
                      id: '',
                      cells: headerRows
                          .reduce((acc, h) => {
                              acc.push(...h.cells);
                              return acc;
                          }, [])
                          .flat(),
                  },
              ],
              style: {
                  gridTemplateColumns: headers[headers.length - 1]?.headers
                      .map((h) => `${h.getSize()}px`)
                      .join(' '),
              },
          };

    const prevCells: any[] = new Array(tableRows[0]?.getVisibleCells()?.length);
    // const firstRow = tableRows[0] as Row<TData>;
    // const cellPositions = (firstRow?.getVisibleCells() || []).reduce((acc, cell, index) => {
    //     const prev = acc[index - 1];
    //     acc.push({
    //         width: cell.column.getSize() || undefined,
    //         left: prev ? prev.left + prev.width : 0,
    //     });
    //     return acc;
    // }, []);
    //
    // console.log({cellPositions});

    return {
        title: typeof config?.title === 'string' ? config.title : config?.title?.text,
        header,
        rows: virtualItems.reduce<BodyRowViewData[]>((rowsAcc, virtualRow) => {
            const row = tableRows[virtualRow.index] as Row<TData>;
            const visibleCells = row.getVisibleCells();

            rowsAcc.push({
                id: row.id,
                index: virtualRow.index,
                cells: visibleCells.reduce<BodyCellViewData[]>((acc, cell, index) => {
                    const originalHeadData = cell.column.columnDef.meta?.head;
                    const enableRowGrouping = get(originalHeadData, 'group', false);
                    // const width = columnOptions[index]?.width;
                    //
                    // const isFixedSize = Boolean(width);
                    const originalCellData = cell.row.original[index];
                    const pinned = Boolean(originalHeadData?.pinned);
                    // const cellClassName = [
                    //     b('td', {pinned, 'fixed-size': isFixedSize}),
                    //     originalCellData?.className,
                    // ]
                    //     .filter(Boolean)
                    //     .join(' ');
                    //

                    if (enableRowGrouping && typeof prevCells[index] !== 'undefined') {
                        // const prevCellIndex = prevCells[index];
                        const prevCellRow = rowsAcc[prevCells[index]];
                        const prevCell = prevCellRow?.cells?.[index];
                        const prevCellData = rowData[prevCellRow?.index][index];
                        // console.log('calculate rowspan', {
                        //     'originalCellData.value': originalCellData.value,
                        //     'prevCellData?.value': prevCellData?.value,
                        //     cellIndex: index,
                        //     currentRowIndex: virtualRow.index,
                        //     prevCellRowIndex: prevCells[index],
                        // });
                        if (originalCellData.value === prevCellData?.value) {
                            prevCell.rowSpan++;
                            return acc;
                        }
                    }

                    // const left = pinned ? originalHeadData?.left : undefined;
                    // const left = cellPositions[index].left;
                    const cellStyle: React.CSSProperties = {
                        width: cell.column.getSize() || undefined,
                        // transform: `translate(${left}px, ${virtualRow.start}px)`,
                        // left,
                        ...originalCellData?.css,
                    };

                    if (typeof originalHeadData?.width !== 'undefined') {
                        cellStyle.whiteSpace = 'normal';
                        cellStyle.wordBreak = 'break-word';
                    } else if (prerender) {
                        cellStyle.whiteSpace = 'nowrap';
                    }

                    const renderCell =
                        typeof cell.column.columnDef.cell === 'function'
                            ? cell.column.columnDef.cell
                            : () => cell.column.columnDef.cell;

                    const cellData = {
                        id: cell.id,
                        index,
                        style: cellStyle,
                        content: renderCell(cell.getContext()),
                        type: originalCellData?.type,
                        pinned,
                        className:
                            typeof originalCellData?.className === 'function'
                                ? originalCellData?.className()
                                : originalCellData?.className,
                        rowSpan: 1,
                        onClick: (event) => {
                            // const tableCommonCell = cell as TableCommonCell;
                            // const actionParams = getCurrentActionParams({config, unresolvedParams});
                            const {
                                enabled: canDrillDown,
                                filters: drillDownFilters,
                                level: drillDownLevel,
                            } = getDrillDownOptions({
                                params: currentParams,
                                config: config?.drillDown,
                            });

                            const tableCommonCell = originalCellData as TableCommonCell;
                            if (tableCommonCell?.onClick?.action === 'setParams') {
                                changeParams(tableCommonCell.onClick.args);
                                return;
                            }

                            if (canDrillDown && tableCommonCell.drillDownFilterValue) {
                                changeParams({
                                    drillDownLevel: [String(drillDownLevel + 1)],
                                    drillDownFilters: drillDownFilters.map(
                                        (filter: string, index: number) => {
                                            if (drillDownLevel === index) {
                                                return String(tableCommonCell.drillDownFilterValue);
                                            }

                                            return filter;
                                        },
                                    ),
                                });
                                return;
                            }

                            if (tableCommonCell.treeNode) {
                                const treeState = getUpdatesTreeState({
                                    cell: tableCommonCell,
                                    params: currentParams,
                                });

                                changeParams(treeState ? {treeState} : {});
                                return;
                            }

                            // if (actionParams?.scope) {
                            //     const cellActionParams = getCellActionParams({
                            //         actionParamsData: actionParams,
                            //         rows: data.rows || [],
                            //         head: data.head,
                            //         row,
                            //         cell: tableCommonCell,
                            //         metaKey: event.metaKey,
                            //     });
                            //
                            //     if (cellActionParams) {
                            //         changeParams({...cellActionParams});
                            //     }
                            // }
                        },
                    };

                    prevCells[index] = rowsAcc.length;
                    acc.push(cellData);
                    return acc;
                }, []),
                ref: (node) => rowVirtualizer.measureElement(node),
                y: virtualRow.start,
            });

            return rowsAcc;
        }, []),
        settings: {
            highlightRows: shouldHighlightRows,
            sticky: true,
        },
        height: prerender ? null : rowVirtualizer.getTotalSize(),
        totalSize: prerender ? null : rowVirtualizer.getTotalSize(),
        renderedItemsSize: prerender
            ? null
            : rowVirtualizer.getVirtualItems().reduce((sum, v) => {
                  return sum + v.size;
              }, 0),
        prerender,
        pagination: {
            enabled: isPaginationEnabled,
            currentPage: Number(currentParams._page) || 0,
            rowsCount: tableRows.length,
            pageLimit: config?.paginator?.limit ?? Infinity,
            onChange: () => {},
        },
    };
};

export const Table = (props: Props) => {
    const {
        dimensions: {height: tableHeight},
    } = props;
    const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
    const {title, header, rows, settings, pagination, prerender, totalSize, renderedItemsSize} =
        usePreparedTableData({
            ...props,
            tableContainerRef,
        });

    console.log('Table render:', {rows});

    const noData = !rows.length;

    const renderHead = (headerGroup: HeadRowViewData) => {
        return headerGroup.cells.map((th, index) => {
            return (
                <th
                    key={th.id}
                    className={b('th', {
                        clickable: th.sortable,
                        pinned: th.pinned,
                        'first-cell': index === 0,
                    })}
                    style={{
                        ...th.style,
                        gridRow: `span ${th.rowSpan}`,
                        gridColumn: `span ${th.colSpan}`,
                    }}
                    colSpan={th.colSpan}
                    rowSpan={th.rowSpan}
                    onClick={th.onClick}
                >
                    <div
                        className={b('th-content', {
                            sortable: th.sortable,
                        })}
                    >
                        {th.content}
                        <SortIcon className={b('sort-icon')} sorting={th.sorting} />
                    </div>
                </th>
            );
        });
    };

    return (
        <React.Fragment>
            <div
                className={b(
                    'snapter-container',
                    [SNAPTER_HTML_CLASSNAME, CHARTKIT_SCROLLABLE_NODE_CLASSNAME].join(' '),
                )}
                ref={tableContainerRef}
                style={{maxHeight: tableHeight}}
            >
                <TableTitle title={title} />
                <div
                    className={b('table-wrapper', {'highlight-rows': settings.highlightRows})}
                    style={{height: totalSize}}
                >
                    {noData && (
                        <div className={b('no-data')}>
                            {i18n('chartkit-table', 'message-no-data')}
                        </div>
                    )}
                    {!noData && (
                        <table className={b({final: !prerender})} style={{height: totalSize}}>
                            <thead className={b('header', {sticky: settings.sticky})}>
                                {header.rows.map((headerGroup) => {
                                    // const gridTemplateColumns = headerGroup.cells
                                    //     .map((c) => `${c.width}px`)
                                    //     .join(' ');

                                    // <tr
                                    //     key={headerGroup.id}
                                    //     className={b('tr')}
                                    //     style={{gridTemplateColumns}}
                                    // >
                                    return (
                                        <tr
                                            key={headerGroup.id}
                                            className={b('tr')}
                                            style={header.style}
                                        >
                                            {renderHead(headerGroup)}
                                        </tr>
                                    );
                                })}
                            </thead>
                            <tbody
                                className={b('body')}
                                style={{
                                    ...header.style,
                                    transform: `translateY(${rows[0]?.y}px)`,
                                }}
                            >
                                {rows.map((row) => {
                                    return (
                                        <tr
                                            data-index={row.index}
                                            key={row.id}
                                            className={b('tr')}
                                            ref={row.ref}
                                        >
                                            {row.cells.map((cell) => {
                                                return (
                                                    <td
                                                        key={cell.id}
                                                        className={b(
                                                            'td',
                                                            {
                                                                type: cell.type,
                                                                pinned: cell.pinned,
                                                                'first-cell': cell.index === 0,
                                                            },
                                                            cell.className,
                                                        )}
                                                        style={{
                                                            ...cell.style,
                                                            gridRow: `span ${cell.rowSpan}`,
                                                        }}
                                                        onClick={cell.onClick}
                                                        rowSpan={cell.rowSpan}
                                                    >
                                                        {cell.content}
                                                        {/*<div*/}
                                                        {/*    className={b('td-content')}*/}
                                                        {/*    // style={{width}}*/}
                                                        {/*>*/}
                                                        {/*    {cell.content}*/}
                                                        {/*</div>*/}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {pagination.enabled && (
                <Paginator
                    page={pagination.currentPage}
                    rowsCount={pagination.rowsCount}
                    limit={pagination.pageLimit}
                    onChange={pagination.onChange}
                />
            )}
        </React.Fragment>
    );
};
