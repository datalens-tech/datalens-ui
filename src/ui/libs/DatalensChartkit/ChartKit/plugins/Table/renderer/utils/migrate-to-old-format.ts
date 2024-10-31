import get from 'lodash/get';
import set from 'lodash/set';
import type {TableCell, TableCommonCell, TableHead, TableRow} from 'shared';

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

    const colsWidth: Record<number, string> = {};
    const rows = originalRows.map<TableRow>((r) => {
        let row: TableRow;
        if (typeof r === 'object' && 'values' in r) {
            row = {
                cells: r.values.map(mapTableCell),
            };
        } else {
            row = r;
        }

        row.cells?.forEach((cell, index) => {
            const cellWidth = get(cell, 'css.width');
            if (cellWidth) {
                colsWidth[index] = cellWidth;
                set(cell as TableCommonCell, 'css.width', undefined);
            }
        });

        return row;
    });

    let colIndex = 0;
    function mapHeadCell(value: TableHead | undefined) {
        const column: Partial<TableHead> = value || {};
        if (!column.id) {
            column.id = String(colIndex);
        }

        if (!column.width && colsWidth[colIndex]) {
            column.width = colsWidth[colIndex];
        }

        colIndex++;

        if ('sub' in column) {
            column.sub?.forEach((col) => mapHeadCell(col));
        }

        return column as TableHead;
    }

    const newHead = head.map((col) => mapHeadCell(col));

    if (newHead.length && rows.length) {
        // old pivot tables
        const firstRow = rows[0];
        if ('cells' in firstRow && !firstRow.cells.length) {
            const cells = new Array(newHead.length).fill(null).map(() => ({value: ''}));
            return {head: newHead, rows: [{cells}], footer};
        }
    }

    return {head: newHead, rows, footer};
}
