import React from 'react';

import {Portal} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import type {StringParams, TableCell, TableCellsRow, TableCommonCell} from 'shared';

import {COMPONENT_CLASSNAME} from '../../../../../../../../components/Widgets/Chart/helpers/helpers';
import {isMacintosh} from '../../../../../../../../utils';
import type {TableWidgetData} from '../../../../../../types';
import Paginator from '../../../../../components/Widget/components/Table/Paginator/Paginator';
import {hasGroups} from '../../../../../components/Widget/components/Table/utils';
import {SNAPTER_HTML_CLASSNAME} from '../../../../../components/Widget/components/constants';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../../../helpers/constants';
import {waitForContent} from '../../../../../helpers/wait-for-content';
import {i18n} from '../../../../../modules/i18n/i18n';
import type {WidgetDimensions} from '../../types';
import {
    getCellActionParams,
    getCellCss,
    getCurrentActionParams,
    getDrillDownOptions,
    getUpdatesTreeState,
    mapTableData,
} from '../../utils';
import type {GetCellActionParamsArgs} from '../../utils';
import {TableTitle} from '../Title/TableTitle';

import {TableBody} from './TableBody';
import {TableFooter} from './TableFooter';
import {TableHead} from './TableHead';
import type {TData} from './types';
import {usePreparedTableData} from './usePreparedTableData';
import {useTableHeight} from './useTableHeight';
import {getTableSizes} from './utils';

import './Table.scss';

const b = block('dl-table');

type Props = {
    widgetData: TableWidgetData;
    dimensions: WidgetDimensions;
    onChangeParams?: (params: StringParams) => void;
    onReady?: () => void;
};

export const Table = React.memo<Props>((props: Props) => {
    const {dimensions: widgetDimensions, widgetData, onChangeParams, onReady} = props;
    const {config, data: originalData, unresolvedParams, params: currentParams} = widgetData;
    const title = typeof config?.title === 'string' ? config.title : config?.title?.text;
    const isPaginationEnabled = Boolean(config?.paginator?.enabled);

    const [cellSizes, setCellSizes] = React.useState<number[] | null>(null);

    const data = React.useMemo(() => mapTableData(originalData), [originalData]);
    const pagination = {
        currentPage: Number(get(currentParams, '_page')) || 0,
        rowsCount: data.rows.length,
        pageLimit: config?.paginator?.limit ?? Infinity,
    };

    const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
    const tableRef = React.useRef<HTMLTableElement | null>(null);

    const actionParams = React.useMemo(() => {
        return getCurrentActionParams({config, unresolvedParams});
    }, [config, unresolvedParams]);

    const changeParams = React.useCallback(
        (values: StringParams | null) => {
            if (onChangeParams && values) {
                onChangeParams(values);
            }
        },
        [onChangeParams],
    );

    const handleSortingChange = React.useCallback(
        (column, sortOrder) => {
            const sortParams: Record<string, string> = {
                _columnId: '',
                _sortOrder: '',
                _sortColumnMeta: JSON.stringify(column?.custom || {}),
            };

            if (column) {
                const columnId = column.id;
                sortParams._columnId = `_id=${columnId}_name=${column.name}`;
                sortParams._sortOrder = String(sortOrder === 'desc' ? -1 : 1);
            }

            changeParams(sortParams);
        },
        [changeParams],
    );

    const {
        enabled: canDrillDown,
        filters: drillDownFilters,
        level: drillDownLevel,
    } = getDrillDownOptions({
        params: currentParams,
        config: config?.drillDown,
    });

    const getCellAdditionStyles = (cell: TableCell, row: TData) => {
        const commonCell = cell as TableCommonCell;
        const isCellClickable =
            Boolean(canDrillDown && commonCell.drillDownFilterValue) ||
            Boolean(commonCell.treeNode) ||
            Boolean(commonCell.onClick) ||
            Boolean(actionParams?.scope);
        const cursor = isCellClickable ? 'pointer' : undefined;
        const actionParamsCss = getCellCss({
            actionParamsData: actionParams,
            row: {cells: row} as TableCellsRow,
            cell,
            head: data.head,
            rows: data.rows || [],
        });

        return {cursor, ...actionParamsCss};
    };

    const {colgroup, header, body, footer, prerender, totalSize} = usePreparedTableData({
        data,
        dimensions: widgetDimensions,
        tableContainerRef,
        manualSorting: isPaginationEnabled || Boolean(config?.settings?.externalSort),
        onSortingChange: handleSortingChange,
        getCellAdditionStyles,
        cellSizes,
    });

    React.useEffect(() => {
        if (cellSizes) {
            setCellSizes(null);
        }
    }, [widgetData.data, widgetDimensions.width]);

    React.useEffect(() => {
        if (onReady && !prerender) {
            setTimeout(onReady, 0);
        }
    }, [onReady, prerender]);

    const highlightRows = get(config, 'settings.highlightRows') ?? !hasGroups(data.head);
    const tableActualHeight = useTableHeight({ref: tableRef, prerender});
    const noData = !props.widgetData.data?.head?.length;

    const handleCellClick = React.useCallback(
        (event: React.MouseEvent, cellData: unknown, rowId: string) => {
            const tableCommonCell = cellData as TableCommonCell;
            if (tableCommonCell?.onClick?.action === 'setParams') {
                changeParams(tableCommonCell.onClick.args);
                return;
            }

            if (canDrillDown && tableCommonCell.drillDownFilterValue) {
                changeParams({
                    drillDownLevel: [String(drillDownLevel + 1)],
                    drillDownFilters: drillDownFilters.map((filter: string, index: number) => {
                        if (drillDownLevel === index) {
                            return String(tableCommonCell.drillDownFilterValue);
                        }

                        return filter;
                    }),
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

            if (actionParams?.scope) {
                const metaKey = isMacintosh() ? event.metaKey : event.ctrlKey;
                const row = body.rows
                    .find((r) => r.id === rowId)
                    ?.cells?.map((c) => c.data) as TData;
                const args: GetCellActionParamsArgs = {
                    actionParamsData: actionParams,
                    rows: data.rows,
                    head: data.head,
                    row,
                    cell: tableCommonCell,
                    metaKey,
                };

                const cellActionParams = getCellActionParams(args);

                if (cellActionParams) {
                    changeParams({...cellActionParams});
                }
            }
        },
        [
            actionParams,
            canDrillDown,
            changeParams,
            currentParams,
            data,
            drillDownFilters,
            drillDownLevel,
        ],
    );

    const handlePaginationChange = React.useCallback(
        (page: number) => changeParams({_page: String(page)}),
        [changeParams],
    );

    return (
        <React.Fragment>
            <div
                className={b(
                    'snapter-container',
                    {preparing: prerender},
                    [SNAPTER_HTML_CLASSNAME, CHARTKIT_SCROLLABLE_NODE_CLASSNAME].join(' '),
                )}
                ref={tableContainerRef}
            >
                <TableTitle title={title} />
                <div className={b('table-wrapper', {'highlight-rows': highlightRows})}>
                    {noData && (
                        <div className={b('no-data')}>
                            {i18n('chartkit-table', 'message-no-data')}
                        </div>
                    )}
                    {!noData && (
                        <table
                            className={b({prepared: !prerender})}
                            style={{minHeight: totalSize}}
                            ref={tableRef}
                        >
                            {colgroup && (
                                <colgroup>
                                    {colgroup.map((col, index) => (
                                        <col width={col.width} key={index} />
                                    ))}
                                </colgroup>
                            )}
                            <TableHead
                                sticky={true}
                                rows={header.rows}
                                style={header.style}
                                tableHeight={tableActualHeight}
                            />
                            <TableBody
                                rows={body.rows}
                                style={body.style}
                                onCellClick={handleCellClick}
                                rowRef={body.rowRef}
                            />
                            <TableFooter rows={footer.rows} style={footer.style} />
                        </table>
                    )}
                </div>
            </div>
            {isPaginationEnabled && (
                <Paginator
                    className={b('paginator', {preparing: prerender})}
                    page={pagination.currentPage}
                    rowsCount={pagination.rowsCount}
                    limit={pagination.pageLimit}
                    onChange={handlePaginationChange}
                />
            )}
            {/*background table for dynamic calculation of column widths during virtualization*/}
            <Portal>
                <div
                    className={b('background-table', COMPONENT_CLASSNAME)}
                    style={{height: widgetDimensions?.height, width: widgetDimensions?.width}}
                >
                    <table
                        className={b({prepared: false})}
                        ref={async (el) => {
                            if (!el) {
                                return;
                            }

                            await waitForContent(el);
                            const tableColSizes = getTableSizes(el);
                            const shouldApplyNewSizes =
                                !cellSizes ||
                                tableColSizes.some((colSize, index) => colSize > cellSizes[index]);

                            if (shouldApplyNewSizes) {
                                setCellSizes(tableColSizes);
                            }
                        }}
                    >
                        <TableHead rows={header.rows} useInheritedWidth={false} />
                        <TableBody rows={body.rows} />
                        <TableFooter rows={footer.rows} />
                    </table>
                </div>
            </Portal>
        </React.Fragment>
    );
});

Table.displayName = 'Table';
