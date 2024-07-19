import React from 'react';

import type {SortingState} from '@tanstack/react-table';
import {
    getCoreRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {useVirtualizer} from '@tanstack/react-virtual';
import block from 'bem-cn-lite';

import {TableBody} from './components/TableBody/TableBody';
import {TableFooter} from './components/TableFooter/TableFooter';
import {TableHead} from './components/TableHead/TableHead';
import {useCellContentWidth, useDevicePixelRatio, useTableDimensions} from './hooks';
import type {TableProps} from './types';
import {getTableColumns, getTableData} from './utils';

import './Table.scss';

const b = block('dl-table');

enum RenderStep {
    CalculateWidth = 'CalculateWidth',
    Final = 'Final',
}

export const Table = (props: TableProps) => {
    const {
        title,
        noData,
        onCellClick,
        header: headerOptions,
        qa,
        manualSorting,
        onSortingChange,
        parentContainer,
    } = props;
    // Todo: 1) отрисовываем всю таблицу(первые N строк) как есть только со стилями но без дополнительных вычислений -
    //  только колонки без ширины(?), ширина всей таблицы - остаток от колонок с известной шириной
    //  таблица должна быть невидима - показываем лоадер
    //  считаем ширину колонок с шириной = auto
    //  отрисовываем финальный вариант таблицы
    //  ??? - посмотреть что, чо сводными, если ширина задана только у внутренней колонки, а у внешней стоит auto
    const currentStep = React.useRef(RenderStep.CalculateWidth);

    const {head, footer, rows} = props.data;
    const tableRef = React.useRef<HTMLTableElement>(null);
    // const cellContentWidths = useCellContentWidth({
    //     rootElement: parentContainer?.current ?? null,
    //     rows,
    // });

    const columns = React.useMemo(() => {
        return getTableColumns({head, rows, footer});
    }, [head, rows, footer]);

    const data = React.useMemo(() => {
        return getTableData({head, rows});
    }, [head, rows]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        sortDescFirst: true,
        manualSorting,
        manualPagination: true,
        state: {
            sorting,
        },
        onSortingChange: (updater) => {
            setSorting(updater);

            if (onSortingChange) {
                const updates = typeof updater === 'function' ? updater(sorting) : updater;
                const {id, desc} = updates[0] || {};
                const headCellData = columns.find((c) => c.id === id)?.meta?.head;
                onSortingChange({cell: headCellData, sortOrder: desc ? 'desc' : 'asc'});
            }
        },
    });

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 30,
        getScrollElement: () => parentContainer.current,
        measureElement: (el) => el?.getBoundingClientRect()?.height ?? 0,
        overscan: 5,
    });

    const {tableDimensions} = useTableDimensions({table: tableRef, data: props.data});

    const shouldShowFooter = columns.some((column) => column.footer);
    const tableRows = table.getRowModel().rows;

    let tableStyle: React.CSSProperties = {};
    const pixelRatio = useDevicePixelRatio();
    if (pixelRatio && pixelRatio > 1) {
        tableStyle = {
            '--dl-table-cell-border-offset': `${-1 / ((pixelRatio % 1) + 1)}px`,
        } as React.CSSProperties;
    }

    return (
        <table ref={tableRef} className={b()} data-qa={qa} style={tableStyle}>
            {title && <caption className={b('title')}>{title.text}</caption>}
            <TableHead
                headers={table.getHeaderGroups()}
                sticky={headerOptions?.sticky}
                tableDimensions={tableDimensions}
            />
            <TableBody
                columns={columns}
                tableDimensions={tableDimensions}
                rows={tableRows}
                noData={noData}
                onCellClick={onCellClick}
                rowVirtualizer={rowVirtualizer}
            />
            {shouldShowFooter && <TableFooter footerGroups={table.getFooterGroups()} />}
        </table>
    );
};
