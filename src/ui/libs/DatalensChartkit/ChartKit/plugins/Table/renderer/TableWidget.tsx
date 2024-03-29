import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import {CaretLeft, CaretRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import {ChartKitTableQa, StringParams, TableCellsRow, TableCommonCell, TableHead} from 'shared';

import {Table} from '../../../../../../components/Table/Table';
import type {
    OnCellClickFn,
    TData,
    THead,
    TableProps,
} from '../../../../../../components/Table/types';
import Paginator from '../../../components/Widget/components/Table/Paginator/Paginator';
import {camelCaseCss} from '../../../components/Widget/components/Table/utils';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../helpers/constants';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import {i18n} from '../../../modules/i18n/i18n';
import Performance from '../../../modules/perfomance';
import type {TableWidgetProps} from '../types';

import {
    getCellActionParams,
    getCellCss,
    getCurrentActionParams,
    getUpdatesTreeState,
} from './utils';
import {getCellContentStyles, renderCellContent} from './utils/renderer';

import './TableWidget.scss';

const b = block('chartkit-table-widget');

type HeadCell = THead & {name: string; formattedName?: string; fieldId?: string; custom?: unknown};

function mapHeadCell(th: TableHead): HeadCell {
    const columnType: TableCommonCell['type'] = get(th, 'type');

    return {
        ...th,
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
        sortingFn: columnType === 'number' ? 'alphanumeric' : undefined,
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
    };
}

const TableWidget = React.forwardRef<ChartKitWidgetRef | undefined, TableWidgetProps>(
    (props, _forwardedRef) => {
        const {
            id,
            onChange,
            onLoad,
            data: {data, config, params: currentParams, unresolvedParams},
        } = props;
        const isPaginationEnabled = Boolean(config?.paginator?.enabled);

        const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, config, id]);
        Performance.mark(generatedId);

        React.useLayoutEffect(() => {
            const widgetRendering = Performance.getDuration(generatedId);

            if (onLoad && widgetRendering) {
                onLoad({widget: props.data, widgetRendering});
            }
        }, [generatedId, onLoad]);

        const changeParams = (params: StringParams | null) => {
            if (onChange && params) {
                onChange({type: 'PARAMS_CHANGED', data: {params}}, {forceUpdate: true}, true);
            }
        };

        const drillDownLevel = Number((currentParams.drillDownLevel || ['0'])[0]);
        const breadcrumbsLength = config?.drillDown?.breadcrumbs.length;
        const drillDownFilters =
            (currentParams.drillDownFilters as string[]) || new Array(breadcrumbsLength).fill('');
        const canDrillDown = !breadcrumbsLength || drillDownLevel !== breadcrumbsLength - 1;

        const actionParams = getCurrentActionParams({config, unresolvedParams});

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

        const tableData: TableProps['data'] = React.useMemo(() => {
            return {
                head: data.head?.map(mapHeadCell),
                rows: (data.rows as TableCellsRow[])?.map<TData>((r) => {
                    return r.cells.map((c, cellIndex) => {
                        const cell = c as TableCommonCell;
                        const isCellClickable =
                            Boolean(canDrillDown && cell.drillDownFilterValue) ||
                            Boolean(cell.treeNode) ||
                            Boolean(cell.onClick) ||
                            Boolean(actionParams?.scope);
                        const cursor = isCellClickable ? 'pointer' : undefined;
                        const actionParamsCss = getCellCss({
                            actionParamsData: actionParams,
                            row: r,
                            cell: c,
                            head: data.head,
                            rows: data.rows || [],
                        });

                        const column = data.head?.[cellIndex];
                        const cellType = cell.type ?? get(column, 'type');
                        let cellClassName: string | undefined;
                        if (cellType === 'number') {
                            cellClassName = b('number-column');
                        }

                        return {
                            ...cell,
                            css: {cursor, ...actionParamsCss, ...camelCaseCss(cell.css)},
                            className: cellClassName,
                        };
                    });
                }),
                footer: ((data.footer?.[0] as TableCellsRow)?.cells || []).map((td) => {
                    const cell = td as TableCommonCell;

                    return {...cell, css: cell.css ? camelCaseCss(cell.css) : undefined};
                }),
            };
        }, [actionParams, canDrillDown, data.footer, data.head, data.rows]);
        const titleText = typeof config?.title === 'string' ? config.title : config?.title?.text;
        const shouldHighlightRows = get(config, 'settings.highlightRows', true);

        return (
            <div
                className={[b(), CHARTKIT_SCROLLABLE_NODE_CLASSNAME].join(' ')}
                data-qa={ChartKitTableQa.Widget}
            >
                {titleText && <div className={b('title')}>{titleText}</div>}
                <div className={b('table-wrapper', {'highlight-rows': shouldHighlightRows})}>
                    <Table
                        data={tableData}
                        noData={{text: i18n('chartkit-table', 'message-no-data')}}
                        onCellClick={handleTableClick}
                        header={{
                            sticky: true,
                        }}
                        manualSorting={isPaginationEnabled}
                        onSortingChange={isPaginationEnabled ? handleSortingChange : undefined}
                    />
                </div>
                {isPaginationEnabled && (
                    <Paginator
                        page={Number(currentParams._page) || 0}
                        rowsCount={tableData.rows?.length}
                        limit={config?.paginator?.limit}
                        onChange={handlePaginationChange}
                    />
                )}
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
