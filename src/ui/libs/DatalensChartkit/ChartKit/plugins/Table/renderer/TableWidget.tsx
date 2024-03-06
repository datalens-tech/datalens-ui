import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import isUndefined from 'lodash/isUndefined';
import {BarTableCell, NumberTableColumn, TableCellsRow, TableCommonCell} from 'shared';
import {Table} from 'ui/components/Table/Table';
import type {THead, TableProps} from 'ui/components/Table/types';
import {Bar} from 'ui/libs/DatalensChartkit/ChartKit/components/Widget/components/Table/Bar/Bar';
import {selectBarSettingValue} from 'ui/libs/DatalensChartkit/ChartKit/components/Widget/components/Table/utils/misc';
import {i18n} from 'ui/libs/DatalensChartkit/ChartKit/modules/i18n/i18n';

import type {TableWidgetProps} from '../types';

import './TableWidget.scss';

const b = block('chartkit-table-widget');

// TODO: grouping
// TODO: hierarchy
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
            data: {data, config, params},
        } = props;

        const handlePaginationChange = (page: number) => {
            if (onChange) {
                onChange(
                    {type: 'PARAMS_CHANGED', data: {params: {_page: String(page)}}},
                    {forceUpdate: true},
                    true,
                );
            }
        };

        const tableData: TableProps['data'] = {
            head: data.head?.map((d, index) => {
                const column: THead = {
                    id: d.id || String(index),
                    header: d.name,
                    width: d.width,
                    enableSorting: true,
                };

                const columnOptions = d as NumberTableColumn;
                switch (columnOptions.view) {
                    case 'bar': {
                        column.renderCell = (cellData) => {
                            const barCellData = cellData as BarTableCell;
                            if (!barCellData) {
                                return null;
                            }

                            const min = isUndefined(barCellData.min)
                                ? columnOptions.min
                                : barCellData.min;
                            const max = isUndefined(barCellData.max)
                                ? columnOptions.max
                                : barCellData.max;

                            return (
                                <Bar
                                    value={Number(barCellData.value)}
                                    formattedValue={barCellData.formattedValue}
                                    align={columnOptions.align || barCellData.align}
                                    barHeight={columnOptions.barHeight || barCellData.barHeight}
                                    min={min}
                                    max={max}
                                    showLabel={selectBarSettingValue(
                                        columnOptions,
                                        barCellData,
                                        'showLabel',
                                    )}
                                    showSeparator={selectBarSettingValue(
                                        columnOptions,
                                        barCellData,
                                        'showSeparator',
                                    )}
                                    debug={selectBarSettingValue(
                                        columnOptions,
                                        barCellData,
                                        'debug',
                                    )}
                                    color={barCellData.barColor}
                                    showBar={barCellData.showBar}
                                    offset={barCellData.offset}
                                />
                            );
                        };
                    }
                }

                return column;
            }),
            rows: (data.rows as TableCellsRow[])?.map((r) => r.cells) as TableCommonCell[][],
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
                        pageIndex: Number(params._page) || 0,
                    }}
                    noData={{text: i18n('chartkit-table', 'message-no-data')}}
                    onPaginationChange={handlePaginationChange}
                />
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
