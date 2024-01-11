import type {Column} from '@gravity-ui/react-data-table';
import type {TableHead} from 'shared';

import {CLICK_ACTION_TYPE} from '../../../../../../modules/constants/constants';
import type {DataTableData} from '../../../../../../types';
import type {TableProps} from '../types';

import {getActionParams, getCellOnClick} from './misc';
import {ActionParamsData} from './types';

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
    head: TableHead[];
}) {
    const {actionParamsData, head, onChange} = args;

    const handleCellClick: Column<DataTableData>['onClick'] = ({row}, col) => {
        const onClick = getCellOnClick(row, col.name);
        const cellActionParams = actionParamsData
            ? getActionParams({
                  actionParamsData,
                  row,
                  column: col,
                  head,
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
            }
        }
    };

    return handleCellClick;
}
