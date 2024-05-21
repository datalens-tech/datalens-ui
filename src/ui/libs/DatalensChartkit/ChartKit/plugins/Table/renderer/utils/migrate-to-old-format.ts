import type {TableHead} from 'shared';

import type {TData} from '../../../../../../../components/Table/types';
import type {TableData} from '../../../../../types';

export function getRowAsMap(args: {row?: TData; head?: TableHead[]}) {
    const {row, head = []} = args;
    return row?.reduce(
        (acc, rowCell, index) => Object.assign(acc, {[head[index]?.id as string]: rowCell}),
        {},
    );
}

export function mapTableData(data: TableData) {
    const {head, rows, footer} = data;

    if (head?.length && rows?.length) {
        // old pivot tables
        const firstRow = rows[0];
        if ('cells' in firstRow && !firstRow.cells.length) {
            const cells = new Array(head.length).fill(null).map(() => ({value: ''}));
            return {head, rows: [{cells}], footer};
        }
    }

    return data;
}
