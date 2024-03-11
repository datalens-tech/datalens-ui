import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import get from 'lodash/get';
import {BarTableCell, BarViewOptions, NumberViewOptions, TableCommonCell, TableHead} from 'shared';

import {numberFormatter} from '../../../../components/Widget/components/Table/utils/misc';
import {BarCell} from '../components/BarCell/BarCell';
import {MarkupCell} from '../components/MarkupCell/MarkupCell';
import {TreeCell} from '../components/TreeCell/TreeCell';

export function getCellContentStyles(args: {cell: TableCommonCell; column: TableHead}) {
    const {cell, column} = args;
    const cellType = cell.type ?? get(column, 'type');
    const contentStyles: React.CSSProperties = {};
    if (cellType === 'number') {
        contentStyles.textAlign = 'right';
    }

    const cellWidth = get(cell, 'width', get(column, 'width'));
    const isPercentWidth = String(cellWidth).slice(-1) === '%';
    if (!isPercentWidth) {
        contentStyles.width = cellWidth;
    }

    return contentStyles;
}

export function renderCellContent(args: {cell: TableCommonCell; column: TableHead}) {
    const {cell, column} = args;
    const cellView = get(cell, 'view', get(column, 'view'));
    const cellType = cell.type ?? get(column, 'type');

    if (cellView === 'bar') {
        return <BarCell cell={cell as BarTableCell} column={column as BarViewOptions} />;
    }

    if (cellType === 'markup') {
        return <MarkupCell cell={cell} />;
    }

    if (cell?.treeNodeState) {
        return <TreeCell cell={cell} />;
    }

    let formattedValue: string | undefined = cell.formattedValue;
    if (typeof formattedValue === 'undefined') {
        if (cellType === 'date') {
            const dateTimeValue = dateTime({
                input: cell.value as number,
                timeZone: 'UTC',
            });
            const dateTimeFormat = get(column, 'format');
            formattedValue = dateTimeValue?.isValid()
                ? dateTimeValue.format(dateTimeFormat)
                : String(cell.value);
        } else if (cellType === 'number') {
            formattedValue = numberFormatter(cell.value as number, column as NumberViewOptions);
        } else {
            formattedValue = String(cell.value);
        }
    }

    return formattedValue;
}
