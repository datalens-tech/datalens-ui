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
    const tableRef = React.useRef<HTMLTableElement>(null);
    const columnsRenderedWidth = React.useRef<number[]>([]);
    const tableDimensions = React.useRef<{height?: number}>({});

    const columns = React.useMemo(
        () => getTableColumns({head, rows, footer}),
        [head, rows, footer],
    );

    React.useEffect(() => {
        if (tableRef.current) {
            const tableCells = Array.from(tableRef.current.rows[0].cells);
            columnsRenderedWidth.current = tableCells.map((el) => {
                return el.getBoundingClientRect().width;
            });
            tableDimensions.current = {height: tableRef.current.getBoundingClientRect().height};
        }
    }, [columns]);

    const data = React.useMemo(() => getTableData({head, rows}), [head, rows]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        sortDescFirst: true,
        manualSorting,
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

    return (
        <table className={b()} data-qa={qa} ref={tableRef}>
            {title && <caption className={b('title')}>{title.text}</caption>}
            <TableHead
                headers={table.getHeaderGroups()}
                sticky={headerOptions?.sticky}
                columnsWidth={columnsRenderedWidth.current}
                tableHeight={tableDimensions.current.height}
            />
            <TableBody
                columns={columns}
                columnsWidth={columnsRenderedWidth.current}
                rows={table.getRowModel().rows}
                noData={noData}
                onCellClick={onCellClick}
            />
            {shouldShowFooter && <TableFooter footerGroups={table.getFooterGroups()} />}
        </table>
    );
};
