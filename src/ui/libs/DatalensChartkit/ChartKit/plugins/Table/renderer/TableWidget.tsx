import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import type {TableCellsRow, TableCommonCell} from 'shared';
import {ChartKitTableQa} from 'shared';

import {Table} from '../../../../../../components/Table/Table';
import type {TData, TableProps} from '../../../../../../components/Table/types';
import Paginator from '../../../components/Widget/components/Table/Paginator/Paginator';
import {camelCaseCss, hasGroups} from '../../../components/Widget/components/Table/utils';
import {SNAPTER_HTML_CLASSNAME} from '../../../components/Widget/components/constants';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../helpers/constants';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import {i18n} from '../../../modules/i18n/i18n';
import Performance from '../../../modules/perfomance';
import {useTableEvents} from '../hooks';
import type {TableWidgetProps} from '../types';

import {getCellCss, getCurrentActionParams, mapTableData} from './utils';
import {getDrillDownOptions} from './utils/drill-down';
import {mapHeadCell} from './utils/renderer';

import './TableWidget.scss';

const b = block('chartkit-table-widget');

type WidgetDimensions = {
    width: number;
    height: number;
};

const TableWidget = React.forwardRef<ChartKitWidgetRef | undefined, TableWidgetProps>(
    (props, _forwardedRef) => {
        const {
            id,
            onChange,
            onLoad,
            data: {data: originalData, config, params: currentParams, unresolvedParams},
            tableRowsRenderLimit,
        } = props;
        const data = React.useMemo(() => mapTableData(originalData), [originalData]);
        const [dimensions, setDimensions] = React.useState<Partial<WidgetDimensions>>();
        const ref = React.useRef<HTMLDivElement | null>(null);
        const titleText = typeof config?.title === 'string' ? config.title : config?.title?.text;
        const shouldHighlightRows = get(config, 'settings.highlightRows') ?? !hasGroups(data.head);
        const isPaginationEnabled = Boolean(config?.paginator?.enabled);
        const actionParams = getCurrentActionParams({config, unresolvedParams});
        const {enabled: canDrillDown} = getDrillDownOptions({
            params: currentParams,
            config: config?.drillDown,
        });

        const handleResize = React.useCallback(() => {
            if (ref.current) {
                const {width, height} = ref.current.getBoundingClientRect();
                setDimensions({width, height});
            }
        }, []);

        React.useLayoutEffect(() => {
            handleResize();
        }, [handleResize]);

        const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, config, id]);
        Performance.mark(generatedId);

        React.useLayoutEffect(() => {
            if (!dimensions?.width) {
                return;
            }

            const widgetRendering = Performance.getDuration(generatedId);

            if (onLoad && widgetRendering) {
                onLoad({widget: props.data, widgetRendering});
            }
        }, [generatedId, onLoad, dimensions]);

        const tableData: TableProps['data'] = React.useMemo(() => {
            if (!dimensions) {
                return {};
            }

            const rows =
                tableRowsRenderLimit && data.rows?.length && data.rows.length > tableRowsRenderLimit
                    ? (data.rows as TableCellsRow[]).slice(0, tableRowsRenderLimit)
                    : (data.rows as TableCellsRow[]);

            return {
                head: data.head?.map((th) => mapHeadCell(th, dimensions?.width, data.head)),
                rows: rows?.map<TData>((r) => {
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
        }, [
            actionParams,
            canDrillDown,
            data.footer,
            data.head,
            data.rows,
            dimensions,
            tableRowsRenderLimit,
        ]);

        const {onCellClick, onSortingChange, onPaginationChange} = useTableEvents({
            onChange,
            data: props.data,
        });

        return (
            <div className={b()} data-qa={ChartKitTableQa.Widget} ref={ref}>
                <div
                    className={b(
                        'snapter-container',
                        [SNAPTER_HTML_CLASSNAME, CHARTKIT_SCROLLABLE_NODE_CLASSNAME].join(' '),
                    )}
                >
                    {titleText && <div className={b('title')}>{titleText}</div>}
                    <div className={b('table-wrapper', {'highlight-rows': shouldHighlightRows})}>
                        {dimensions?.width && (
                            <Table
                                data={tableData}
                                noData={{text: i18n('chartkit-table', 'message-no-data')}}
                                onCellClick={onCellClick}
                                header={{
                                    sticky: true,
                                }}
                                manualSorting={isPaginationEnabled}
                                onSortingChange={isPaginationEnabled ? onSortingChange : undefined}
                            />
                        )}
                    </div>
                </div>
                {isPaginationEnabled && (
                    <Paginator
                        page={Number(currentParams._page) || 0}
                        rowsCount={tableData.rows?.length}
                        limit={config?.paginator?.limit}
                        onChange={onPaginationChange}
                    />
                )}
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
