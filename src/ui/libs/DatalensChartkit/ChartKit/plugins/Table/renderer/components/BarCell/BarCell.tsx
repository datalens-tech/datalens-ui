import React from 'react';

import get from 'lodash/get';
import type {BarTableCell, NumberTableColumn} from 'shared';

import {Bar} from '../../../../../components/Widget/components/Table/Bar/Bar';
import {selectBarSettingValue} from '../../../../../components/Widget/components/Table/utils/misc';

type BarCellProps = {
    cell?: BarTableCell;
    column: NumberTableColumn;
};

export const BarCell = (props: BarCellProps) => {
    const {cell, column} = props;

    if (!cell || column.view !== 'bar') {
        return null;
    }

    return (
        <Bar
            value={Number(cell.value)}
            formattedValue={cell.formattedValue}
            align={column.align || cell.align}
            barHeight={column.barHeight || cell.barHeight}
            min={get(cell, 'min', column.min)}
            max={get(cell, 'max', column.max)}
            showLabel={selectBarSettingValue(column, cell, 'showLabel')}
            showSeparator={selectBarSettingValue(column, cell, 'showSeparator')}
            debug={selectBarSettingValue(column, cell, 'debug')}
            color={cell.barColor}
            showBar={cell.showBar}
            offset={cell.offset}
        />
    );
};
