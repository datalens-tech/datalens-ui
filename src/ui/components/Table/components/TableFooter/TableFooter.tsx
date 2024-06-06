import React from 'react';

import type {HeaderGroup} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import type {TData} from '../../types';

const b = block('dl-table');

type Props = {
    footerGroups: HeaderGroup<TData>[];
};

export const TableFooter = (props: Props) => {
    const {footerGroups} = props;

    return (
        <tfoot className={b('footer')}>
            {footerGroups.map((footerGroup) => (
                <tr key={footerGroup.id} className={b('tr')}>
                    {footerGroup.headers.map((header) => {
                        const columnDef = header.column.columnDef;
                        const style = columnDef?.meta?.footer?.css;

                        return (
                            <td key={header.id} className={b('td')} style={style}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(columnDef.footer, header.getContext())}
                            </td>
                        );
                    })}
                </tr>
            ))}
        </tfoot>
    );
};
