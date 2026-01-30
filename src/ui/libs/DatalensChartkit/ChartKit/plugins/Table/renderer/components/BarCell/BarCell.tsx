import React from 'react';

import get from 'lodash/get';
import type {BarTableCell, BarViewOptions} from 'shared';

import {Bar} from '../../../../../components/Widget/components/Table/Bar/Bar';
import {selectBarSettingValue} from '../../../../../components/Widget/components/Table/utils/misc';

type BarCellProps = {
    cell?: BarTableCell;
    column: BarViewOptions;
};

export const BarCell = (props: BarCellProps) => {
    const {cell, column} = props;

    const formattedValue = React.useMemo(() => {
        if (cell?.formattedValue) {
            return cell.formattedValue;
        }

        if (cell?.value === null) {
            return String(cell.value);
        }

        return undefined;
    }, [cell?.formattedValue, cell?.value]);

    if (!cell) {
        return null;
    }

    return (
        <Bar
            value={Number(cell.value)}
            formattedValue={formattedValue}
            align={get(cell, 'align', get(column, 'align'))}
            barHeight={get(cell, 'barHeight', get(column, 'barHeight'))}
            min={get(cell, 'min', column.min)}
            max={get(cell, 'max', column.max)}
            showLabel={selectBarSettingValue(column, cell, 'showLabel')}
            showSeparator={selectBarSettingValue(column, cell, 'showSeparator')}
            debug={selectBarSettingValue(column, cell, 'debug')}
            color={get(cell, 'barColor', get(column, 'barColor'))}
            showBar={cell.showBar}
            offset={cell.offset}
        />
    );
};
