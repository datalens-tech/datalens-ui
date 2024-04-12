import React from 'react';

import type {Table} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {TData} from '../../types';
import {TableBody} from '../TableBody/TableBody';
import {TableHead} from '../TableHead/TableHead';

import './TableGhost.scss';

type Props = {
    table: Table<TData>;
};

const b = block('dl-table');

export const TableGhost = React.forwardRef<HTMLTableElement, Props>((props: Props, ref) => {
    const {table} = props;
    const columns = table.getAllColumns();
    const tableRows = table.getRowModel().rows;

    return (
        <div className={b('ghost-wrapper')}>
            <table ref={ref} className={b()}>
                <TableHead headers={table.getHeaderGroups()} />
                <TableBody columns={columns} rows={tableRows} />
            </table>
        </div>
    );
});
