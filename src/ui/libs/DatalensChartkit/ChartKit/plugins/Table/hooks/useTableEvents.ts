import React from 'react';

import type {StringParams, TableCommonCell} from 'shared';

import type {OnCellClickFn, TableProps} from '../../../../../../components/Table/types';
import type {TableWidget} from '../../../../types';
import {getCellActionParams, getCurrentActionParams, getUpdatesTreeState} from '../renderer/utils';
import {getDrillDownOptions} from '../renderer/utils/drill-down';
import type {HeadCell} from '../renderer/utils/renderer';
import type {TableWidgetProps} from '../types';

type UseTableEventsArgs = {
    data: TableWidget;
    onChange: TableWidgetProps['onChange'];
};

export const useTableEvents = (options: UseTableEventsArgs) => {
    const {
        onChange,
        data: {data, config, params: currentParams, unresolvedParams},
    } = options;

    const changeParams = React.useCallback(
        (params: StringParams | null) => {
            if (onChange && params) {
                onChange({type: 'PARAMS_CHANGED', data: {params}}, {forceUpdate: true}, true);
            }
        },
        [onChange],
    );

    const handleTableClick: OnCellClickFn = React.useCallback(
        ({cell, row, event}) => {
            const tableCommonCell = cell as TableCommonCell;
            const actionParams = getCurrentActionParams({config, unresolvedParams});
            const {
                enabled: canDrillDown,
                filters: drillDownFilters,
                level: drillDownLevel,
            } = getDrillDownOptions({
                params: currentParams,
                config: config?.drillDown,
            });

            if (tableCommonCell.onClick?.action === 'setParams') {
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
        },
        [changeParams, config, currentParams, data, unresolvedParams],
    );

    const handlePaginationChange = React.useCallback(
        (page: number) => changeParams({_page: String(page)}),
        [changeParams],
    );

    const handleSortingChange: TableProps['onSortingChange'] = React.useCallback(
        (args) => {
            const {cell, sortOrder} = args;
            const headCell = cell as HeadCell;
            const params = {
                _columnId: '',
                _sortOrder: '',
                _sortColumnMeta: JSON.stringify(headCell?.custom || {}),
            };

            if (cell) {
                const columnId = headCell.fieldId ?? headCell.id;
                params._columnId = `_id=${columnId}_name=${headCell.name}`;
                params._sortOrder = String(sortOrder === 'desc' ? -1 : 1);
            }

            changeParams(params);
        },
        [changeParams],
    );

    return {
        onSortingChange: handleSortingChange,
        onCellClick: handleTableClick,
        onPaginationChange: handlePaginationChange,
    };
};
