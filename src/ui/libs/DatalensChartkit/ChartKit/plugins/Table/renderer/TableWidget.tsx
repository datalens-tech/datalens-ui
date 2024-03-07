import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import {
    BarTableCell,
    NumberTableColumn,
    StringParams,
    TableCellsRow,
    TableCommonCell,
} from 'shared';
import {Table} from 'ui/components/Table/Table';
import type {OnTableClick, THead, TableProps} from 'ui/components/Table/types';
import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';

import type {TableWidgetProps} from '../types';

import {BarCell} from './components/BarCell/BarCell';

import './TableWidget.scss';

const b = block('chartkit-table-widget');

// TODO: grouping
// TODO: tree
// TODO: markdown
// TODO: sticky header
// TODO: chart-chart
// TODO: export
// TODO: rendering time
const TableWidget = React.forwardRef<ChartKitWidgetRef | undefined, TableWidgetProps>(
    (props, _forwardedRef) => {
        const {
            onChange,
            data: {data, config, params: currentParams},
        } = props;

        const changeParams = (params: StringParams) => {
            if (onChange) {
                onChange({type: 'PARAMS_CHANGED', data: {params}}, {forceUpdate: true}, true);
            }
        };

        const drillDownLevel = Number((currentParams.drillDownLevel || ['0'])[0]);
        const breadcrumbsLength = config?.drillDown?.breadcrumbs.length;
        const drillDownFilters =
            (currentParams.drillDownFilters as string[]) || new Array(breadcrumbsLength).fill('');
        const canDrillDown = !breadcrumbsLength || drillDownLevel !== breadcrumbsLength - 1;

        const handleTableClick: OnTableClick = ({cell}) => {
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
        };

        const handlePaginationChange = (page: number) => changeParams({_page: String(page)});

        const tableData: TableProps['data'] = {
            head: data.head?.map((d, index) => {
                const column: THead = {
                    id: `${d.id}_${index}`,
                    header: d.name,
                    width: d.width,
                    enableSorting: true,
                };

                const tableColumn = d as NumberTableColumn;
                switch (tableColumn.view) {
                    case 'bar': {
                        column.renderCell = (cellData) => (
                            <BarCell cell={cellData as BarTableCell} column={tableColumn} />
                        );
                    }
                }

                return column;
            }),
            rows: (data.rows as TableCellsRow[])?.map<TableCommonCell[]>((r) => {
                return r.cells.map((c) => {
                    const cell = c as TableCommonCell;
                    const isCellClickable = Boolean(canDrillDown && cell.drillDownFilterValue);

                    return {
                        ...cell,
                        css: {cursor: isCellClickable ? 'pointer' : undefined, ...cell.css},
                    };
                });
            }),
            footer: ((data.footer?.[0] as TableCellsRow)?.cells || []) as TableCommonCell[],
        };

        return (
            <div className={b()}>
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
                />
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
