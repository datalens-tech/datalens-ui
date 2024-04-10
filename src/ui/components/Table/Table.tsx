import React from 'react';

import type {SortingState} from '@tanstack/react-table';
import {
    getCoreRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {TableBody} from './components/TableBody/TableBody';
import {TableFooter} from './components/TableFooter/TableFooter';
import {TableHead} from './components/TableHead/TableHead';
import {useTableDimensions} from './hooks/use-table-dimensions';
import type {TableProps} from './types';
import {getTableColumns, getTableData} from './utils';

import './Table.scss';

const b = block('dl-table');

export const Table = (props: TableProps) => {
    const {
        title,
        noData,
        onCellClick,
        header: headerOptions,
        qa,
        manualSorting,
        onSortingChange,
    } = props;
    const {head, footer, rows} = props.data;
    const tableRef = React.useRef<HTMLTableElement>(null);

    const columns = React.useMemo(() => {
        return getTableColumns({head, rows, footer});
    }, [head, rows, footer]);

    const {tableDimensions} = useTableDimensions({table: tableRef, data: props.data});

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

    const shouldShowFooter = columns.some((column) => column.footer);
    const tableRows = table.getRowModel().rows;

    let tableStyle;
    if ('devicePixelRatio' in window && window.devicePixelRatio < 2) {
        tableStyle = {'--cell-border-offset': '-0.55px'} as React.CSSProperties;
    }

    return (
        <table className={b()} data-qa={qa} ref={tableRef} style={tableStyle}>
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
            />
            {shouldShowFooter && <TableFooter footerGroups={table.getFooterGroups()} />}
        </table>
    );
};
