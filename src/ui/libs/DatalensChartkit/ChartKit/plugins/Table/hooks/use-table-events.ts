import {StringParams, TableCommonCell} from 'shared';
import {OnCellClickFn, TableProps} from 'ui/components/Table/types';

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
    const actionParams = getCurrentActionParams({config, unresolvedParams});
    const {
        enabled: canDrillDown,
        filters: drillDownFilters,
        level: drillDownLevel,
    } = getDrillDownOptions({
        params: currentParams,
        config: config?.drillDown,
    });

    const changeParams = (params: StringParams | null) => {
        if (onChange && params) {
            onChange({type: 'PARAMS_CHANGED', data: {params}}, {forceUpdate: true}, true);
        }
    };

    const handleTableClick: OnCellClickFn = ({cell, row, event}) => {
        const tableCommonCell = cell as TableCommonCell;

        if (tableCommonCell.onClick) {
            if (tableCommonCell.onClick.action === 'setParams') {
                changeParams(tableCommonCell.onClick.args);
                return;
            }
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
    };

    const handlePaginationChange = (page: number) => changeParams({_page: String(page)});

    const handleSortingChange: TableProps['onSortingChange'] = (args) => {
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
    };

    return {
        onSortingChange: handleSortingChange,
        onCellClick: handleTableClick,
        onPaginationChange: handlePaginationChange,
    };
};
