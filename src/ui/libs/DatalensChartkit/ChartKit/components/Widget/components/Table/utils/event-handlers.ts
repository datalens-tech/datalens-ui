import type {Column} from '@gravity-ui/react-data-table';
import get from 'lodash/get';
import type {TableHead, TableRow} from 'shared';
import {isMacintosh} from 'ui/utils';
import {isActivityResultDataValid} from 'ui/utils/chart-activity';

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
    runAction: TableProps['runAction'];
    onAction: TableProps['onAction'];
    head: TableHead[];
    rows: TableRow[];
}) {
    const {actionParamsData, head, rows, onChange, onAction, runAction} = args;

    const handleCellClick: Column<DataTableData>['onClick'] = ({row}, col, event) => {
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
            case 'runAction': {
                runAction?.({...onClick?.args}).then((responseData) => {
                    const activityResultData = get(responseData, 'data');

                    if (onAction) {
                        if (isActivityResultDataValid(activityResultData)) {
                            onAction({data: activityResultData});
                        } else {
                            throw new Error('Invalid activity result format');
                        }
                    }
                });

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
            }
        }
    };

    return handleCellClick;
}
