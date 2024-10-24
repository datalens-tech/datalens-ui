import React from 'react';

import {dateTimeUtc} from '@gravity-ui/date-utils';
import {CaretLeft, CaretRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import type {
    BarTableCell,
    BarViewOptions,
    DiffTableColumn,
    NumberViewOptions,
    TableCommonCell,
    TableHead,
    WrappedHTML,
} from 'shared';
import {ChartKitTableQa, isMarkupItem} from 'shared';

import {MarkdownHelpPopover} from '../../../../../../../components/MarkdownHelpPopover/MarkdownHelpPopover';
import {DEFAULT_DATE_FORMAT} from '../../../../../../../constants/misc';
import {numberFormatter} from '../../../../components/Widget/components/Table/utils/misc';
import {BarCell} from '../components/BarCell/BarCell';
import {DiffCell} from '../components/DiffCell/DiffCell';
import {HtmlCell} from '../components/HtmlCell/HtmlCell';
import {MarkupCell} from '../components/MarkupCell/MarkupCell';
import type {THead} from '../components/Table/types';
import {TreeCell} from '../components/TreeCell/TreeCell';

import {calculateNumericProperty} from './math';

const b = block('chartkit-table-widget');

export type HeadCell = THead & {
    name: string;
    formattedName?: WrappedHTML | string;
    fieldId?: string;
    custom?: unknown;
};

export function mapHeadCell(th: TableHead, tableWidth: number | undefined): HeadCell {
    const columnType: TableCommonCell['type'] = get(th, 'type');
    const hint = get(th, 'hint');

    return {
        ...th,
        width: calculateNumericProperty({value: th.width, base: tableWidth}),
        id: String(th.id),
        header: () => {
            const cell = {
                value: th.markup ?? th.name,
                // Remove condition after wrappedHTML being supported for new Table
                formattedValue: typeof th.formattedName === 'string' ? th.formattedName : undefined,
                type: th.markup ? 'markup' : columnType,
            };
            return (
                <span data-qa={ChartKitTableQa.HeadCellContent}>
                    {renderCellContent({cell, column: th, header: true})}
                    {hint && <MarkdownHelpPopover markdown={hint} />}
                </span>
            );
        },
        enableSorting: get(th, 'sortable', true),
        enableRowGrouping: get(th, 'group', false),
        cell: (cellData) => {
            const cell = (cellData || {}) as TableCommonCell;
            return (
                <React.Fragment>
                    {renderCellContent({cell, column: th})}
                    {cell.sortDirection && (
                        <Icon
                            className={b('sort-icon')}
                            data={cell.sortDirection === 'asc' ? CaretLeft : CaretRight}
                        />
                    )}
                </React.Fragment>
            );
        },
        columns: get(th, 'sub', []).map((subColumn: TableHead) =>
            mapHeadCell(subColumn, tableWidth),
        ),
        pinned: get(th, 'pinned', false),
    };
}

export function getCellContentStyles(args: {
    cell: TableCommonCell;
    column: TableHead;
    columns: TableHead[];
}) {
    const {cell, column, columns} = args;
    const cellType = cell.type ?? get(column, 'type');
    const contentStyles: React.CSSProperties = {};
    if (cellType === 'number') {
        contentStyles.textAlign = 'right';
    }

    // Width of the table should take 100%, so we cannot use the width settings when they are set for all cells
    const canUseCellWidth = columns.some((col) => !col.width);
    if (canUseCellWidth) {
        const cellWidth = get(cell, 'width', get(column, 'width'));
        const isPercentWidth = String(cellWidth).slice(-1) === '%';
        if (!isPercentWidth) {
            contentStyles.width = cellWidth;
        }
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

    if (cellType === 'markup' || isMarkupItem(cell.value)) {
        return <MarkupCell cell={cell} />;
    }

    if (!header) {
        if (cellView === 'bar') {
            return <BarCell cell={cell as BarTableCell} column={column as BarViewOptions} />;
        }

        if (cellType === 'diff') {
            const [value, diff] = (cell.value ?? []) as [number, number];
            return <DiffCell value={value} diff={diff} column={column as DiffTableColumn} />;
        }

        if (cellType === 'diff_only') {
            return (
                <DiffCell
                    diff={cell.value as number}
                    column={column as DiffTableColumn}
                    diffOnly={true}
                />
            );
        }

        if (cell?.treeNodeState) {
            return <TreeCell cell={cell} />;
        }
    }

    let formattedValue: string | undefined = cell.formattedValue;
    if (!formattedValue) {
        if (cell.value === null) {
            formattedValue = String(cell.value);
        } else if (cellType === 'date' && cell.value) {
            const dateTimeValue = dateTimeUtc({input: cell.value as string});
            const dateTimeFormat = get(column, 'format', DEFAULT_DATE_FORMAT);
            formattedValue = dateTimeValue?.isValid()
                ? dateTimeValue.format(dateTimeFormat)
                : String(cell.value);
        } else if (cellType === 'number') {
            formattedValue = numberFormatter(cell.value as number, column as NumberViewOptions);
        } else {
            formattedValue = String(cell.value ?? '');
        }
    }

    if (cell.link?.href) {
        const {href, newWindow = true} = cell.link;
        const content = {
            tag: 'a',
            attributes: {
                href,
                target: newWindow ? '_blank' : '_self',
            },
            content: formattedValue,
        };
        return <HtmlCell content={content} />;
    }

    return formattedValue;
}
