import React from 'react';

import {Minus, Plus} from '@gravity-ui/icons';
import type {Column, SortOrder} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {Button, Icon, Link, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import moment from 'moment';
import type {
    BarTableCell,
    BarViewOptions,
    CommonTableColumn,
    DateTableColumn,
    DiffTableColumn,
    NumberTableColumn,
    NumberViewOptions,
    StringParams,
    TableCell,
    TableColumn,
    TableCommonCell,
    TableHead,
    TableRow,
} from 'shared';
import {ChartKitTableQa, isMarkupItem} from 'shared';
import {isWrappedHTML} from 'shared/utils/ui-sandbox';

import {MarkdownHelpPopover} from '../../../../../../../../components/MarkdownHelpPopover/MarkdownHelpPopover';
import {Markup} from '../../../../../../../../components/Markup';
import {markupToRawString} from '../../../../../../modules/table';
import type {ChartKitDataTable, DataTableData} from '../../../../../../types';
import {Bar} from '../Bar/Bar';
import {WrappedHTMLNode} from '../WrappedHTMLNode';
import type {TableProps} from '../types';

import {getAdditionalStyles, getRowActionParams, isCellSelected} from './action-params';
import {getCellClickArgs, getCellOnClickHandler} from './event-handlers';
import {
    camelCaseCss,
    generateName,
    getCellWidth,
    getTreeSetColumnSortAscending,
    hasTreeSetColumn,
    isCellValueNullable,
    numberFormatter,
    prepareLinkHref,
    selectBarSettingValue,
} from './misc';
import type {ActionParamsData} from './types';

const b = block('chartkit-table');
const DATE_FORMAT_BY_SCALE = {
    d: 'DD.MM.YYYY',
    w: 'DD.MM.YYYY',
    m: 'MMMM YYYY',
    h: 'DD.MM.YYYY HH:mm',
    i: 'DD.MM.YYYY HH:mm',
    s: 'DD.MM.YYYY HH:mm:ss',
    q: 'YYYY',
    y: 'YYYY',
};
export const MiscQA = {
    TREE_NODE_STATE_OPENED: 'chartkit-tree-node-state-opened',
    TREE_NODE_STATE_CLOSED: 'chartkit-tree-node-state-closed',
};

type RestOptions = Omit<TableColumn, 'id' | 'name' | 'type' | 'css' | 'group' | 'autogroup'> & {
    tableWidth?: number;
    resize?: () => void;
};

type SortIconProps = {
    direction: 'asc' | 'desc';
};
const SortIcon = ({direction}: SortIconProps) => {
    return (
        <svg
            className={b('sort-icon', {[direction]: true})}
            viewBox="0 0 10 6"
            width="10"
            height="6"
        >
            <path fill="currentColor" d="M0 5h10l-5 -5z" />
        </svg>
    );
};

const diffFormatter = (
    value: number,
    {precision, diff_formatter: formatter}: Omit<DiffTableColumn, 'type'>,
) => {
    const diff = numberFormatter(value, {precision, formatter, view: 'number'});
    if (value > 0) {
        return <span className={b('diff', {pos: true})}>&#9650;{diff}</span>;
    }
    if (value < 0) {
        return <span className={b('diff', {neg: true})}>&#9660;{diff}</span>;
    }
    return <span className={b('diff')}>{diff}</span>;
};

// eslint-disable-next-line complexity
export function valueFormatter(
    columnType: CommonTableColumn['type'],
    cell: TableCell = {value: ''},
    options: RestOptions = {},
): React.ReactNode {
    let resultValue;
    let sortIcon = null;
    let type = columnType;

    if (typeof cell === 'object' && cell) {
        if ('type' in cell && cell.type) {
            type = cell.type;
        }

        // Fallback (needed to support already created Editor charts).
        // type bar is deprecated was merged with number.
        // Now the number column has a prop view that determines whether to show a number or draw a bar
        if (type === 'bar') {
            type = 'number';
            (options as NumberTableColumn).view = 'bar';
        }

        const shouldUseBar =
            (options as NumberTableColumn).view === 'bar' || (cell as BarTableCell).view === 'bar';

        if ('formattedValue' in cell && cell.formattedValue && !shouldUseBar) {
            resultValue = isWrappedHTML(cell.formattedValue) ? (
                <WrappedHTMLNode value={cell.formattedValue} />
            ) : (
                cell.formattedValue
            );
        } else if (cell.value === null) {
            resultValue = 'null';
        } else if (isMarkupItem(cell.value)) {
            resultValue = (
                <Markup
                    item={cell.value}
                    externalProps={{
                        url: {
                            onClick: (event: React.SyntheticEvent) => {
                                // need to stop propagation for link components because it works incorrect with sorting by rows
                                // user click by link it leads to call both actions at the same time
                                // now clicking on the link will only open it without sorting table
                                event.stopPropagation();
                            },
                        },
                        user_info: {
                            onRender: options?.resize,
                        },
                    }}
                />
            );
        } else if (isWrappedHTML(cell.value)) {
            resultValue = <WrappedHTMLNode value={cell.value} />;
        } else if ('value' in cell) {
            resultValue = cell.value;

            if (type === 'text') {
                const {link: {href, newWindow = true} = {}} = cell;

                resultValue = href ? (
                    <Link
                        view="normal"
                        href={prepareLinkHref(href)}
                        target={newWindow ? '_blank' : '_self'}
                        className={b('link')}
                    >
                        {resultValue}
                    </Link>
                ) : (
                    numberFormatter(resultValue as string | number, options as NumberViewOptions)
                );
            }

            if (type === 'date') {
                const {
                    /** @deprecated use format */
                    scale,
                    format = 'DD.MM.YYYY',
                } = options as Pick<DateTableColumn, 'format' | 'scale'>;
                const resultFormat = scale ? DATE_FORMAT_BY_SCALE[scale] : format;
                const date = moment.utc(resultValue as number);
                resultValue = date.isValid() ? date.format(resultFormat) : resultValue;
            }

            if (type === 'number') {
                if (shouldUseBar) {
                    const barCell = cell as BarTableCell;
                    const columnOptions = options as BarViewOptions;
                    const min = isUndefined(barCell.min) ? columnOptions.min : barCell.min;
                    const max = isUndefined(barCell.max) ? columnOptions.max : barCell.max;

                    resultValue = (
                        <Bar
                            value={barCell.value as number}
                            formattedValue={barCell.formattedValue}
                            align={columnOptions.align || barCell.align}
                            barHeight={columnOptions.barHeight || barCell.barHeight}
                            min={min}
                            max={max}
                            showLabel={selectBarSettingValue(columnOptions, barCell, 'showLabel')}
                            showSeparator={selectBarSettingValue(
                                columnOptions,
                                barCell,
                                'showSeparator',
                            )}
                            debug={selectBarSettingValue(columnOptions, barCell, 'debug')}
                            color={barCell.barColor}
                            showBar={barCell.showBar}
                            offset={barCell.offset}
                        />
                    );
                } else {
                    resultValue = numberFormatter(
                        resultValue as number,
                        options as NumberViewOptions,
                    );
                }
            }

            if (type === 'diff') {
                const number = numberFormatter(
                    (resultValue as [number, number])[0],
                    options as NumberViewOptions,
                );

                const diff = diffFormatter(
                    (resultValue as [number, number])[1],
                    options as Omit<DiffTableColumn, 'type'>,
                );
                resultValue = (
                    <div>
                        {number} {diff}
                    </div>
                );
            }

            if (type === 'diff_only') {
                resultValue = diffFormatter(
                    resultValue as number,
                    options as Omit<DiffTableColumn, 'type'>,
                );
            }
        }

        if (cell.sortDirection) {
            sortIcon = <SortIcon direction={cell.sortDirection} />;
        }
    }

    let button = null;

    if (typeof cell !== 'string' && 'treeNodeState' in cell && cell.treeNodeState) {
        const opened = cell.treeNodeState === 'open';
        const qa = opened ? MiscQA.TREE_NODE_STATE_OPENED : MiscQA.TREE_NODE_STATE_CLOSED;
        button = (
            <span style={{marginLeft: 10 * (cell.treeOffset || 0), marginRight: 4}}>
                <Button qa={qa} className="table-action-btn" view="outlined" size="s">
                    <Icon data={opened ? Minus : Plus} size={12} />
                </Button>
            </span>
        );
    }

    const cellOnClickEvent: TableCommonCell['onClick'] | undefined = get(cell, 'onClick');
    const shouldShowTooltip = cellOnClickEvent?.action === 'showMsg';

    return (
        <div
            className={b('content', {
                [type]: true,
                null: isCellValueNullable(cell),
                'with-fixed-height': Boolean(
                    'barHeight' in options && (options as BarViewOptions).barHeight,
                ),
            })}
            style={{
                width: getCellWidth(options.width, options.tableWidth),
                ...camelCaseCss(options.contentCss),
            }}
            key={Math.random()}
            data-qa={ChartKitTableQa.CellContent}
        >
            {button}
            {shouldShowTooltip ? (
                <Popover content={cellOnClickEvent?.args?.message} trigger="click">
                    <React.Fragment>{resultValue}</React.Fragment>
                </Popover>
            ) : (
                resultValue
            )}
            {sortIcon}
        </div>
    );
}

function getHeaderNode(column: TableHead) {
    const {markup, formattedName, name} = column;
    const hint = 'hint' in column ? column.hint : undefined;
    let content: React.ReactNode;

    if (markup) {
        content = <Markup item={markup} />;
    } else if (isWrappedHTML(formattedName)) {
        content = <WrappedHTMLNode value={formattedName} />;
    } else {
        content = formattedName ?? name;
    }

    return (
        <span className={b('head-cell', {'with-markup': Boolean(markup)})}>
            {content}
            {hint && <MarkdownHelpPopover markdown={hint} />}
        </span>
    );
}

export const getColumnsAndNames = ({
    onChange,
    onAction,
    runAction,
    head,
    rows,
    context,
    tableWidth,
    level = 0,
    shift = 0,
    topLevelWidth,
    tableRef,
    actionParamsData,
}: {
    onChange: TableProps['onChange'];
    runAction: TableProps['runAction'];
    onAction: TableProps['onAction'];
    head: TableHead[];
    rows: TableRow[];
    context: {isHasGroups: boolean};
    tableRef: ChartKitDataTable | undefined;
    level?: number;
    shift?: number;
    tableWidth?: number;
    topLevelWidth?: number;
    actionParamsData?: ActionParamsData;
}) => {
    const resizeTable = debounce(() => tableRef?.resize());

    const hasSomeCellSelected = Boolean(
        actionParamsData?.params &&
            !isEmpty(actionParamsData.params) &&
            rows.some(
                (r) =>
                    'cells' in r && r.cells.some((c) => isCellSelected(c, actionParamsData.params)),
            ),
    );

    return head.reduce(
        // eslint-disable-next-line complexity
        (
            result: {
                columns: Column<DataTableData>[];
                names: string[];
                sortSettings: {
                    manualSortOrder: SortOrder | undefined;
                    shouldResetSortOrder: boolean;
                };
            },
            column: TableHead,
            index: number,
        ) => {
            if (column && 'sub' in column) {
                const currentColumnWidth = getCellWidth(column.width, tableWidth) || topLevelWidth;
                const {columns, names, sortSettings} = getColumnsAndNames({
                    tableRef,
                    head: column.sub,
                    rows,
                    context,
                    level: level + 1,
                    shift: index,
                    onChange,
                    onAction,
                    runAction,
                    tableWidth,
                    topLevelWidth: currentColumnWidth
                        ? currentColumnWidth / column.sub.length
                        : undefined,
                    actionParamsData,
                });
                const columnName = generateName({
                    id: column.id,
                    name: column.name,
                    level,
                    shift,
                    index,
                });

                const columnData: Column<DataTableData> = {
                    name: columnName,
                    header: getHeaderNode(column),
                    customStyle: ({row, header, name}) => {
                        if (header) {
                            return camelCaseCss(column.css);
                        }

                        const style = {};
                        const cell = row && row[name];

                        if (typeof cell === 'object' && cell?.css) {
                            Object.assign(style, cell.css);
                        }

                        return camelCaseCss(style);
                    },
                    align: DataTable.CENTER,
                    sub: columns,
                };

                result.sortSettings.shouldResetSortOrder =
                    result.sortSettings.shouldResetSortOrder || sortSettings.shouldResetSortOrder;
                result.sortSettings.manualSortOrder =
                    result.sortSettings.manualSortOrder || sortSettings.manualSortOrder;

                result.columns.push(columnData);
                result.names = result.names.concat(names);
            } else {
                const {id, name, type, css: columnCss, group, autogroup, ...options} = column;
                const columnWidth = topLevelWidth || column.width;
                const columnName = generateName({id, name, level, shift, index});

                const isColumnSortable =
                    typeof column.sortable === 'undefined' ? true : column.sortable;

                const isGroupSortAvailable = context.isHasGroups
                    ? Boolean(options.allowGroupSort)
                    : true;

                // These ifs have been added to manually control the display of sorting icons in the crosstabs
                // currentSortDirection prop means which sort direction the tables have now.
                // currentSortDirection: desc | asc | null.
                if (
                    column.custom?.nextSortDirection === 'desc' &&
                    column.custom?.currentSortDirection === null &&
                    tableRef?.table?.state.sortColumns.includes(columnName)
                ) {
                    result.sortSettings.shouldResetSortOrder = true;
                } else if (column.custom?.currentSortDirection) {
                    result.sortSettings.manualSortOrder = {
                        columnId: columnName,
                        order:
                            column.custom?.currentSortDirection === 'asc'
                                ? DataTable.ASCENDING
                                : DataTable.DESCENDING,
                    };
                }

                const isHeadColumn = get(column, 'header');
                const isSelectable =
                    context.isHasGroups && !isHeadColumn && actionParamsData?.scope === 'cell';
                const columnData: Column<DataTableData> = {
                    name: columnName,
                    header: getHeaderNode(column),
                    className: b('cell', {
                        type,
                        'with-fixed-width': Boolean(columnWidth),
                        selectable: isSelectable,
                    }),
                    accessor: (row) => {
                        const column = row[columnName];
                        if (typeof column === 'object' && column && 'value' in column) {
                            const value = column.value;

                            if (typeof value === 'object') {
                                return JSON.stringify(value);
                            } else if (Array.isArray(value)) {
                                return value[0];
                            } else {
                                return value;
                            }
                        }
                        // there are cases when the number of columns and received values do not equal
                        return null;
                    },
                    render: ({row}) =>
                        valueFormatter(type, row[columnName], {
                            ...options,
                            width: columnWidth,
                            tableWidth,
                            resize: resizeTable,
                        } as RestOptions),
                    customStyle: ({row, header, name}) => {
                        if (header) {
                            return camelCaseCss(columnCss);
                        }
                        const cell = row && row[name];

                        const defaultStyles: React.CSSProperties = {};
                        const cellClickArgs = getCellClickArgs(row, columnName);
                        let rowActionParams: StringParams | undefined;
                        let additionalStyles: React.CSSProperties | undefined;

                        if (!isHeadColumn && actionParamsData) {
                            rowActionParams = getRowActionParams({row, head});
                            additionalStyles = getAdditionalStyles({
                                actionParamsData,
                                row,
                                head,
                                cell,
                                hasSomeCellSelected,
                            });
                        }

                        if (cellClickArgs || rowActionParams) {
                            defaultStyles.cursor = 'pointer';
                        }

                        if (additionalStyles) {
                            Object.assign(defaultStyles, additionalStyles);
                        }

                        if (typeof cell === 'object' && cell?.css) {
                            Object.assign(defaultStyles, cell.css);
                        }

                        return camelCaseCss(defaultStyles);
                    },
                    sortAccessor: (row) => {
                        const column = row[columnName];

                        if (typeof column === 'object' && isMarkupItem(column.value)) {
                            return markupToRawString(column.value);
                        }

                        if (typeof column === 'object' && column && 'value' in column) {
                            const value = column.value;
                            return Array.isArray(value) ? value[0] : value;
                        }
                        return null;
                    },
                    sortAscending: hasTreeSetColumn(rows[0])
                        ? getTreeSetColumnSortAscending(columnName, rows)
                        : undefined,
                    onClick: getCellOnClickHandler({
                        actionParamsData: isHeadColumn ? undefined : actionParamsData,
                        head,
                        rows,
                        onChange,
                        onAction,
                        runAction,
                    }),
                    sortable: isGroupSortAvailable && isColumnSortable,
                    width: columnWidth,
                    group,
                    autogroup,
                };

                result.columns.push(columnData);
                result.names.push(columnName);
            }

            return result;
        },
        {
            columns: [],
            names: [],
            sortSettings: {manualSortOrder: undefined, shouldResetSortOrder: false},
        },
    );
};
