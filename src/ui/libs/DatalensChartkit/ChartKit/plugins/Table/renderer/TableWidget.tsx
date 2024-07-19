import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import get from 'lodash/get';

import type {StringParams, TableCellsRow, TableCommonCell} from 'shared';
import {ChartKitTableQa} from 'shared';
import {SortIcon} from 'ui/components/Table/components/SortIcon/SortIcon';
import {TableBody} from 'ui/components/Table/components/TableBody/TableBody';
import {TableFooter} from 'ui/components/Table/components/TableFooter/TableFooter';
import {TableHead} from 'ui/components/Table/components/TableHead/TableHead';
import {getColumnWidth, getTableColumns, getTableData} from 'ui/components/Table/utils';
import type {TableWidgetData} from 'ui/libs/DatalensChartkit/types';
import Loader from 'ui/units/dash/components/Loader/Loader';

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

import {Table} from './components/Table/Table';
import {getCellCss, getCurrentActionParams, mapTableData} from './utils';
import {getDrillDownOptions} from './utils/drill-down';
import {mapHeadCell} from './utils/renderer';

import './TableWidget.scss';

import type {WidgetDimensions} from 'ui/libs/DatalensChartkit/ChartKit/plugins/Table/renderer/types';

const b = block('chartkit-table-widget');

const TableWidget = React.forwardRef<ChartKitWidgetRef | undefined, TableWidgetProps>(
    (props, forwardedRef) => {
        const {
            id,
            onChange,
            onLoad,
            data: {data: originalData, config, params: currentParams, unresolvedParams},
        } = props;

        const generatedId = React.useMemo(
            () => `${id}_${getRandomCKId()}`,
            [originalData, config, id],
        );
        Performance.mark(generatedId);

        const ref = React.useRef<HTMLDivElement | null>(null);
        const [dimensions, setDimensions] = React.useState<Partial<WidgetDimensions>>();
        const handleResize = React.useCallback(() => {
            console.log('TableWidget: handleResize');
            if (ref.current) {
                const {width, height} = ref.current.getBoundingClientRect();
                setDimensions({width, height});
            }
        }, []);

        const debuncedHandleResize = React.useMemo(
            () => debounce(handleResize, 200),
            [handleResize],
        );

        React.useLayoutEffect(() => {
            handleResize();
        }, [handleResize]);

        React.useImperativeHandle(
            forwardedRef,
            () => ({
                reflow() {
                    debuncedHandleResize();
                },
            }),
            [debuncedHandleResize],
        );

        React.useEffect(() => {
            window.addEventListener('resize', debuncedHandleResize);

            return () => {
                window.removeEventListener('resize', debuncedHandleResize);
            };
        }, [debuncedHandleResize]);

        React.useLayoutEffect(() => {
            if (!dimensions?.width) {
                return;
            }

            const widgetRendering = Performance.getDuration(generatedId);

            if (onLoad && widgetRendering) {
                console.log('TableWidget onLoad');
                onLoad({widget: props.data, widgetRendering});
            }
        }, [generatedId, onLoad, dimensions]);

        console.log('TableWidget', {props});

        const handleChangeParams = React.useCallback(
            (params: StringParams) => {
                if (onChange) {
                    onChange({type: 'PARAMS_CHANGED', data: {params}}, {forceUpdate: true}, true);
                }
            },
            [onChange],
        );

        // const isPaginationEnabled = Boolean(config?.paginator?.enabled);
        // const actionParams = getCurrentActionParams({config, unresolvedParams});
        // const {enabled: canDrillDown} = getDrillDownOptions({
        //     params: currentParams,
        //     config: config?.drillDown,
        // });
        //
        // const tableData: TableProps['data'] = React.useMemo(() => {
        //     if (!dimensions) {
        //         return {};
        //     }
        //
        //     return {
        //         head: data.head?.map((th) => mapHeadCell(th, dimensions?.width, data.head)),
        //         rows: (data.rows as TableCellsRow[])?.map<TData>((r) => {
        //             return r.cells.map((c, cellIndex) => {
        //                 const cell = c as TableCommonCell;
        //                 const isCellClickable =
        //                     Boolean(canDrillDown && cell.drillDownFilterValue) ||
        //                     Boolean(cell.treeNode) ||
        //                     Boolean(cell.onClick) ||
        //                     Boolean(actionParams?.scope);
        //                 const cursor = isCellClickable ? 'pointer' : undefined;
        //                 const actionParamsCss = getCellCss({
        //                     actionParamsData: actionParams,
        //                     row: r,
        //                     cell: c,
        //                     head: data.head,
        //                     rows: data.rows || [],
        //                 });
        //
        //                 const column = data.head?.[cellIndex];
        //                 const cellType = cell.type ?? get(column, 'type');
        //                 let cellClassName: string | undefined;
        //                 if (cellType === 'number') {
        //                     cellClassName = b('number-column');
        //                 }
        //
        //                 return {
        //                     ...cell,
        //                     css: {cursor, ...actionParamsCss, ...camelCaseCss(cell.css)},
        //                     className: cellClassName,
        //                 };
        //             });
        //         }),
        //         footer: ((data.footer?.[0] as TableCellsRow)?.cells || []).map((td) => {
        //             const cell = td as TableCommonCell;
        //
        //             return {...cell, css: cell.css ? camelCaseCss(cell.css) : undefined};
        //         }),
        //     };
        // }, [actionParams, canDrillDown, data.footer, data.head, data.rows, dimensions]);

        return (
            <div className={b()} data-qa={ChartKitTableQa.Widget} ref={ref}>
                {dimensions ? (
                    <Table
                        widgetData={props.data}
                        dimensions={dimensions}
                        onChangeParams={handleChangeParams}
                    />
                ) : (
                    <Loader />
                )}
            </div>
        );
    },
);

TableWidget.displayName = 'TableWidget';

export default TableWidget;
