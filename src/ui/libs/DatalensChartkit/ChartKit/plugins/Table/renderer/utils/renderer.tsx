import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {CaretLeft, CaretRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import {
    BarTableCell,
    BarViewOptions,
    ChartKitTableQa,
    NumberViewOptions,
    TableCommonCell,
    TableHead,
    isMarkupItem,
} from 'shared';

import type {THead} from '../../../../../../../components/Table/types';
import {numberFormatter} from '../../../../components/Widget/components/Table/utils/misc';
import {BarCell} from '../components/BarCell/BarCell';
import {MarkupCell} from '../components/MarkupCell/MarkupCell';
import {TreeCell} from '../components/TreeCell/TreeCell';

import {calculateNumericProperty} from './math';

const b = block('chartkit-table-widget');

export type HeadCell = THead & {
    name: string;
    formattedName?: string;
    fieldId?: string;
    custom?: unknown;
};

export function mapHeadCell(th: TableHead, tableWidth?: number): HeadCell {
    const columnType: TableCommonCell['type'] = get(th, 'type');
    const cellWidth = calculateNumericProperty({value: th.width, base: tableWidth});

    return {
        ...th,
        width: cellWidth,
        id: String(th.id),
        header: () => {
            const cell = {
                value: th.markup ?? th.name,
                formattedValue: th.formattedName,
                type: th.markup ? 'markup' : columnType,
            };
            return (
                <span data-qa={ChartKitTableQa.HeadCellContent}>
                    {renderCellContent({cell, column: th, header: true})}
                </span>
            );
        },
        enableSorting: get(th, 'sortable', true),
        sortingFn: columnType === 'number' ? 'alphanumeric' : 'auto',
        enableRowGrouping: get(th, 'group', false),
        cell: (cellData) => {
            const cell = cellData as TableCommonCell;
            const contentStyles = getCellContentStyles({
                cell,
                column: th,
            });
            return (
                <div data-qa={ChartKitTableQa.CellContent} style={{...contentStyles}}>
                    {renderCellContent({cell, column: th})}
                    {cell.sortDirection && (
                        <Icon
                            className={b('sort-icon')}
                            data={cell.sortDirection === 'asc' ? CaretLeft : CaretRight}
                        />
                    )}
                </div>
            );
        },
        columns: get(th, 'sub', []).map(mapHeadCell),
        pinned: get(th, 'pinned', false),
    };
}

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

export function renderCellContent(args: {
    cell: TableCommonCell;
    column: TableHead;
    header?: boolean;
}) {
    const {cell, column, header} = args;
    const cellView = get(cell, 'view', get(column, 'view'));
    const cellType = cell.type ?? get(column, 'type');

    if (cellView === 'bar' && !header) {
        return <BarCell cell={cell as BarTableCell} column={column as BarViewOptions} />;
    }

    if (cellType === 'markup' || isMarkupItem(cell.value)) {
        return <MarkupCell cell={cell} />;
    }

    if (cell?.treeNodeState && !header) {
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
