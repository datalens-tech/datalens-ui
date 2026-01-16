import type {Column} from '@gravity-ui/react-data-table';
import type {TableHead, TableRow, TableWidgetEventScope, WidgetEvent} from 'shared';
import {isMacintosh} from 'ui/utils';

import {CLICK_ACTION_TYPE} from '../../../../../../modules/constants/constants';
import type {DataTableData} from '../../../../../../types';
import type {TableProps} from '../types';

import {getActionParams} from './action-params';
import {getCellOnClick} from './misc';
import type {ActionParamsData} from './types';

export const getCellClickArgs = (row: DataTableData | undefined, columnName: string) => {
    const onClick = getCellOnClick(row, columnName);
    if (onClick && onClick.action === CLICK_ACTION_TYPE.SET_PARAMS && onClick.args) {
        return onClick.args;
    }

    return undefined;
};

export function getCellOnClickHandler(args: {
    actionParamsData?: ActionParamsData;
    onChange: TableProps['onChange'];
    runActivity: TableProps['runActivity'];
    head: TableHead[];
    rows: TableRow[];
    events?: WidgetEvent<TableWidgetEventScope>[];
}) {
    const {actionParamsData, head, rows, events, runActivity, onChange} = args;

    const handleCellClick: Column<DataTableData>['onClick'] = ({row, index}, col, event) => {
        const onClick = getCellOnClick(row, col.name);
        const cell = row && col.name ? row[col.name] : undefined;
        const metaKey = isMacintosh() ? event.metaKey : event.ctrlKey;
        const cellActionParams = actionParamsData
            ? getActionParams({
                  actionParamsData,
                  row,
                  cell,
                  head,
                  metaKey,
                  rows,
              })
            : undefined;

        switch (onClick?.action) {
            case 'setParams': {
                if (onChange) {
                    onChange(
                        {
                            type: 'PARAMS_CHANGED',
                            data: {params: Object.assign({}, onClick?.args, cellActionParams)},
                        },
                        {forceUpdate: true},
                        true,
                        true,
                    );
                }

                break;
            }
            case 'showMsg': {
                // no additional processing is required - the tooltip is generated in the render function
                break;
            }
            default: {
                if (cellActionParams && onChange) {
                    onChange(
                        {
                            type: 'PARAMS_CHANGED',
                            data: {params: Object.assign({}, cellActionParams)},
                        },
                        {forceUpdate: true},
                        true,
                        true,
                    );
                }

                const runActivityEvent = events?.find((e) => {
                    const handlers = Array.isArray(e.handler) ? e.handler : [e.handler];
                    return handlers.some((h) => h.type === 'runActivity');
                });

                if (runActivityEvent && runActivity) {
                    const params = runActivityEvent.scope === 'cell' ? cell : rows[index];
                    runActivity({params: params as any});
                }
            }
        }
    };

    return handleCellClick;
}
