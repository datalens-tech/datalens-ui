import React from 'react';

import block from 'bem-cn-lite';
import get from 'lodash/get';
import type {StringParams, TableCell, TableCellsRow, TableCommonCell} from 'shared';

import type {TableWidgetData} from '../../../../../../types';
import Paginator from '../../../../../components/Widget/components/Table/Paginator/Paginator';
import {hasGroups} from '../../../../../components/Widget/components/Table/utils';
import {SNAPTER_HTML_CLASSNAME} from '../../../../../components/Widget/components/constants';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../../../helpers/constants';
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

import './Table.scss';

const b = block('dl-table');

type Props = {
    widgetData: TableWidgetData;
    dimensions: WidgetDimensions;
    onChangeParams?: (params: StringParams) => void;
};

export const Table = React.memo<Props>((props: Props) => {
    const {dimensions: widgetDimensions, widgetData, onChangeParams} = props;
    const {config, data: originalData, unresolvedParams, params: currentParams} = widgetData;
    const title = typeof config?.title === 'string' ? config.title : config?.title?.text;
    const isPaginationEnabled = Boolean(config?.paginator?.enabled);

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
                const columnId = get(column, 'fieldId', column.id);
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

    const getCellAdditionStyles = (cell: TableCell, rowIndex: number) => {
        const commonCell = cell as TableCommonCell;
        const isCellClickable =
            Boolean(canDrillDown && commonCell.drillDownFilterValue) ||
            Boolean(commonCell.treeNode) ||
            Boolean(commonCell.onClick) ||
            Boolean(actionParams?.scope);
        const cursor = isCellClickable ? 'pointer' : undefined;
        const actionParamsCss = getCellCss({
            actionParamsData: actionParams,
            row: data.rows[rowIndex] as TableCellsRow,
            cell,
            head: data.head,
            rows: data.rows || [],
        });

        return {cursor, ...actionParamsCss};
    };

    const {header, body, footer, prerender, totalSize} = usePreparedTableData({
        widgetData,
        data,
        dimensions: widgetDimensions,
        tableContainerRef,
        manualSorting: isPaginationEnabled,
        onSortingChange: handleSortingChange,
        getCellAdditionStyles,
    });

    const highlightRows = get(config, 'settings.highlightRows') ?? !hasGroups(data.head);
    const tableActualHeight = useTableHeight({ref: tableRef, prerender});
    const noData = !props.widgetData.data?.head?.length;

    const handleCellClick = React.useCallback(
        (event: React.MouseEvent, cellData: unknown, rowIndex: number) => {
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
                const args: GetCellActionParamsArgs = {
                    actionParamsData: actionParams,
                    rows: data.rows,
                    head: data.head,
                    row: (data.rows[rowIndex] as TableCellsRow)?.cells as TData,
                    cell: tableCommonCell,
                    metaKey: Boolean(event.metaKey),
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
                    [SNAPTER_HTML_CLASSNAME, CHARTKIT_SCROLLABLE_NODE_CLASSNAME].join(' '),
                )}
                ref={tableContainerRef}
                style={{maxHeight: widgetDimensions.height}}
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
                            className={b({final: !prerender})}
                            style={{minHeight: totalSize}}
                            ref={tableRef}
                        >
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
                            />
                            <TableFooter rows={footer.rows} style={body.style} />
                        </table>
                    )}
                </div>
            </div>
            {isPaginationEnabled && (
                <Paginator
                    page={pagination.currentPage}
                    rowsCount={pagination.rowsCount}
                    limit={pagination.pageLimit}
                    onChange={handlePaginationChange}
                />
            )}
        </React.Fragment>
    );
});

Table.displayName = 'Table';
