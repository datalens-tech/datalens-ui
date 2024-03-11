import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import {ChartKitTableQa, StringParams, TableCellsRow, TableCommonCell} from 'shared';
import {Table} from 'ui/components/Table/Table';
import type {OnTableClick, TData, THead, TableProps} from 'ui/components/Table/types';
import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';

import Paginator from '../../../components/Widget/components/Table/Paginator/Paginator';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../helpers/constants';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import Performance from '../../../modules/perfomance';
import type {TableWidgetProps} from '../types';

import {
    getCellActionParams,
    getCellCss,
    getCurrentActionParams,
    getUpdatesTreeState,
} from './utils';
import {getCellContentStyles, renderCellContent} from './utils/renderer';

import './TableWidget.scss';

const b = block('chartkit-table-widget');

const TableWidget = React.forwardRef<ChartKitWidgetRef | undefined, TableWidgetProps>(
    (props, _forwardedRef) => {
        const {
            id,
            onChange,
            onLoad,
            data: {data, config, params: currentParams, unresolvedParams},
        } = props;

        const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, config, id]);
        Performance.mark(generatedId);

        React.useLayoutEffect(() => {
            const widgetRendering = Performance.getDuration(generatedId);

            if (onLoad && widgetRendering) {
                onLoad({widget: props.data, widgetRendering});
            }
        }, [generatedId, onLoad]);

        const changeParams = (params: StringParams | null) => {
            if (onChange && params) {
                onChange({type: 'PARAMS_CHANGED', data: {params}}, {forceUpdate: true}, true);
            }
        };

        const drillDownLevel = Number((currentParams.drillDownLevel || ['0'])[0]);
        const breadcrumbsLength = config?.drillDown?.breadcrumbs.length;
        const drillDownFilters =
            (currentParams.drillDownFilters as string[]) || new Array(breadcrumbsLength).fill('');
        const canDrillDown = !breadcrumbsLength || drillDownLevel !== breadcrumbsLength - 1;

        const actionParams = getCurrentActionParams({config, unresolvedParams});

        const handleTableClick: OnTableClick = ({cell, row, event}) => {
            const tableCommonCell = cell as TableCommonCell;

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
            }

            if (tableCommonCell.treeNode) {
                const treeState = getUpdatesTreeState({
                    cell: tableCommonCell,
                    params: currentParams,
                });

                changeParams(treeState ? {treeState} : {});
            }

            if (actionParams?.scope) {
                const cellActionParams = getCellActionParams({
                    actionParamsData: actionParams,
                    rows: data.rows || [],
                    head: data.head,
                    row,
                    cell: tableCommonCell,
                    metaKey: event.metaKey,
                });

                if (cellActionParams) {
                    changeParams({...cellActionParams});
                }
            }
        };

        const handlePaginationChange = (page: number) => changeParams({_page: String(page)});

        const tableData: TableProps['data'] = {
            head: data.head?.map((d, index) => {
                const column: THead = {
                    id: `${d.id}_${index}`,
                    header: d.name,
                    width: d.width,
                    enableSorting: true,
                    renderCell: (cellData) => {
                        const cell = cellData as TableCommonCell;
                        const contentStyles = getCellContentStyles({
                            cell,
                            column: d,
                        });
                        return (
                            <div data-qa={ChartKitTableQa.CellContent} style={{...contentStyles}}>
                                {renderCellContent({cell, column: d})}
                            </div>
                        );
                    },
                };

                return column;
            }),
            rows: (data.rows as TableCellsRow[])?.map<TData>((r) => {
                return r.cells.map((c, cellIndex) => {
                    const cell = c as TableCommonCell;
                    const isCellClickable =
                        Boolean(canDrillDown && cell.drillDownFilterValue) ||
                        Boolean(cell.treeNode) ||
                        Boolean(actionParams?.scope);
                    const cursor = isCellClickable ? 'pointer' : undefined;
                    const actionParamsCss = getCellCss({
                        actionParamsData: actionParams,
                        row: r,
                        cell: c,
                        head: data.head,
                        rows: data.rows || [],
                    });

                    const column = data.head?.[cellIndex];
                    const cellType = cell.type ?? get(column, 'type');
                    let cellClassName: string | undefined;
                    if (cellType === 'number') {
                        cellClassName = b('number-column');
                    }

                    return {
                        ...cell,
                        css: {cursor, ...actionParamsCss, ...cell.css},
                        className: cellClassName,
                    };
                });
            }),
            footer: ((data.footer?.[0] as TableCellsRow)?.cells || []) as TableCommonCell[],
        };

        const isPaginationEnabled = Boolean(config?.paginator?.enabled);

        return (
            <div
                className={[b(), CHARTKIT_SCROLLABLE_NODE_CLASSNAME].join(' ')}
                data-qa={ChartKitTableQa.Widget}
            >
                <Table
                    data={tableData}
                    title={config?.title}
                    noData={{text: i18n('chartkit-table', 'message-no-data')}}
                    onClick={handleTableClick}
                    header={{
                        sticky: true,
                    }}
                    qa={{
                        header: ChartKitTableQa.Header,
                        row: ChartKitTableQa.Row,
                        cell: ChartKitTableQa.Cell,
                    }}
                />
                {isPaginationEnabled && (
                    <Paginator
                        page={Number(currentParams._page) || 0}
                        rowsCount={tableData.rows?.length}
                        limit={config?.paginator?.limit}
                        onChange={handlePaginationChange}
                    />
                )}
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
