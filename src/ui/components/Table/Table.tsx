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
    const columns = React.useMemo(() => getTableColumns({head, footer}), [head, footer]);
    const data = React.useMemo(() => getTableData({head, rows}), [head, rows]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        sortDescFirst: false,
        manualSorting,
        state: {
            sorting,
        },
        onSortingChange: (updater) => {
            setSorting(updater);

            if (onSortingChange) {
                const updates = typeof updater === 'function' ? updater(sorting) : updater;
                const id = updates[0]?.id;
                const desc = updates[0]?.desc;
                const headCellData = columns.find((c) => c.id === id)?.meta?.head;
                onSortingChange({cell: headCellData, sortOrder: desc ? 'desc' : 'asc'});
            }
        },
    });

    const shouldShowFooter = columns.some((column) => column.footer);

    return (
        <table className={b()} data-qa={qa}>
            {title && <caption className={b('title')}>{title.text}</caption>}
            <TableHead headers={table.getHeaderGroups()} sticky={headerOptions?.sticky} />
            <TableBody
                columns={columns}
                rows={table.getRowModel().rows}
                noData={noData}
                onCellClick={onCellClick}
            />
            {shouldShowFooter && <TableFooter footerGroups={table.getFooterGroups()} />}
        </table>
    );
};
