import type {TableCell, TableHead, TableRow} from 'shared';

import type {TableData} from '../../../../../types';
import type {TData} from '../components/Table/types';

export function getRowAsMap(args: {row?: TData; head?: TableHead[]}) {
    const {row, head = []} = args;
    return row?.reduce(
        (acc, rowCell, index) => Object.assign(acc, {[head[index]?.id as string]: rowCell}),
        {},
    );
}

function mapTableCell(cell: unknown) {
    if (cell && typeof cell === 'object' && 'value' in cell) {
        return cell as TableCell;
    }

    return {
        value: cell,
    } as TableCell;
}

export function mapTableData(data: TableData | undefined): Required<TableData> {
    const {head = [], footer = []} = data || {};
    const originalRows: TableRow[] = data?.rows ?? [];

    const newHead = head.map((col, index) => {
        if (!col?.id) {
            return {...col, id: String(index)};
        }

        return col;
    });

    const rows = originalRows.map<TableRow>((r) => {
        if (typeof r === 'object' && 'values' in r) {
            return {
                cells: r.values.map(mapTableCell),
            };
        }

        return r;
    });

    if (head.length && rows?.length) {
        // old pivot tables
        const firstRow = rows[0];
        if ('cells' in firstRow && !firstRow.cells.length) {
            const cells = new Array(head.length).fill(null).map(() => ({value: ''}));
            return {head: newHead, rows: [{cells}], footer};
        }
    }

    return {head: newHead, rows, footer};
}
