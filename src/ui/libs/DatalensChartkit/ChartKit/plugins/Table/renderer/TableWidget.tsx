import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import {
    BarTableCell,
    ChartKitTableQa,
    NumberTableColumn,
    StringParams,
    TableCellsRow,
    TableCommonCell,
} from 'shared';
import {Table} from 'ui/components/Table/Table';
import type {OnTableClick, THead, TableProps} from 'ui/components/Table/types';
import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';

import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../helpers/constants';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import Performance from '../../../modules/perfomance';
import type {TableWidgetProps} from '../types';

import {BarCell} from './components/BarCell/BarCell';
import {MarkupCell} from './components/MarkupCell/MarkupCell';
import {TreeCell} from './components/TreeCell/TreeCell';
import {
    getCellActionParams,
    getCellCss,
    getCurrentActionParams,
    getUpdatesTreeState,
} from './utils';

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
                        const columnView = get(d, 'view');
                        const cellType = cell.type;

                        if (columnView === 'bar') {
                            return (
                                <BarCell
                                    cell={cell as BarTableCell}
                                    column={d as NumberTableColumn}
                                />
                            );
                        }

                        if (cellType === 'markup') {
                            return <MarkupCell cell={cell} />;
                        }

                        if (cell?.treeNodeState) {
                            return <TreeCell cell={cell} />;
                        }

                        return (
                            <span data-qa={ChartKitTableQa.CellContent}>
                                {cellData.formattedValue ?? cellData.value}
                            </span>
                        );
                    },
                };

                return column;
            }),
            rows: (data.rows as TableCellsRow[])?.map<TableCommonCell[]>((r) => {
                return r.cells.map((c) => {
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

                    return {
                        ...cell,
                        css: {cursor, ...actionParamsCss, ...cell.css},
                    };
                });
            }),
            footer: ((data.footer?.[0] as TableCellsRow)?.cells || []) as TableCommonCell[],
        };

        return (
            <div
                className={[b(), CHARTKIT_SCROLLABLE_NODE_CLASSNAME].join(' ')}
                data-qa={ChartKitTableQa.Widget}
            >
                <Table
                    data={tableData}
                    title={config?.title}
                    pagination={{
                        enabled: Boolean(config?.paginator?.enabled),
                        pageSize: config?.paginator?.limit,
                        pageIndex: Number(currentParams._page) || 0,
                        onChange: handlePaginationChange,
                    }}
                    noData={{text: i18n('chartkit-table', 'message-no-data')}}
                    onClick={handleTableClick}
                    header={{
                        sticky: true,
                    }}
                    qa={{
                        row: ChartKitTableQa.Row,
                        cell: ChartKitTableQa.Cell,
                    }}
                />
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
