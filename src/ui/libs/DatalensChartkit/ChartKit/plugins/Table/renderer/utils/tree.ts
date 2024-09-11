import type {SortingFnOption} from '@tanstack/react-table';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import type {StringParams, TableCell, TableCellsRow, TableCommonCell, TableRow} from 'shared';

import type {CellData, TData} from '../components/Table/types';

function isSubarray(main: string[], sub: string[]) {
    return (
        main.length >= sub.length &&
        sub.every((_, subIndex) => {
            return main[subIndex] === sub[subIndex];
        })
    );
}

export function getUpdatesTreeState(args: {cell: TableCommonCell; params: StringParams}) {
    const {cell, params} = args;
    const treeNode = cell.treeNode;

    if (!treeNode) {
        return null;
    }

    const treeState: string[] = ([] as string[]).concat(params.treeState).filter(Boolean);

    if (treeState.some((state) => state === treeNode)) {
        const cellTreeNode: string[] = JSON.parse(treeNode);
        const treeStateNodes = treeState.map((jsonArray) => JSON.parse(jsonArray));
        treeStateNodes.forEach((item, index) => {
            if (isSubarray(item, cellTreeNode)) {
                treeState.splice(index, 1, '');
            }
        });
    } else {
        treeState.push(treeNode);
    }

    return treeState.filter(Boolean);
}

type Cell = TData | TableCell | CellData;
type Row = Cell[];

function getParentRow(treeCellColumnIndex: number, row: Row, rows: TableRow[]): Row | null {
    if (treeCellColumnIndex !== -1) {
        const currentRowCell = row[treeCellColumnIndex];
        const parentTreeNode = getCellTreeNode(currentRowCell)?.slice(0, -1);

        const parentRowIndex = rows.findIndex((item) => {
            return (item as TableCellsRow).cells?.some((cell) =>
                isEqual(getCellTreeNode(cell), parentTreeNode),
            );
        });

        if (parentRowIndex !== -1) {
            return (rows[parentRowIndex] as TableCellsRow).cells;
        }
    }

    return null;
}

export function getTreeCellColumnIndex(row?: TableCellsRow) {
    return row?.cells?.findIndex((cell) => Boolean(get(cell, 'treeNode'))) ?? -1;
}

export function getCellTreeNode(column: Cell): string[] | null {
    if (column && typeof column === 'object' && 'treeNode' in column) {
        try {
            return JSON.parse(get(column, 'treeNode', ''));
        } catch (e) {}
    }

    return null;
}

export function getTreeSetColumnSortAscending(
    columnIndex: number,
    rows: TableRow[],
): SortingFnOption<TData> {
    const treeCellColumnIndex = getTreeCellColumnIndex(rows[0] as TableCellsRow);

    return (row1, row2) => {
        const column1 = row1.original[columnIndex];
        const column2 = row2.original[columnIndex];

        let sortComparisonValue = 0;
        if (typeof column1 === 'object' && typeof column2 === 'object') {
            if (treeCellColumnIndex !== -1) {
                const getComparisonRows = (r1?: Row | null, r2?: Row | null): [Row?, Row?] => {
                    if (!r1 || !r2) {
                        return [];
                    }

                    const tn1 = getCellTreeNode(r1[treeCellColumnIndex]) || [];
                    const tn2 = getCellTreeNode(r2[treeCellColumnIndex]) || [];
                    const key1 = tn1?.slice(0, -1).join('');
                    const key2 = tn2?.slice(0, -1).join('');

                    if (key1 === key2) {
                        return [r1, r2];
                    }

                    if (tn1.length === tn2.length) {
                        return getComparisonRows(
                            getParentRow(treeCellColumnIndex, r1, rows),
                            getParentRow(treeCellColumnIndex, r2, rows),
                        );
                    }

                    if (tn1.length > tn2.length) {
                        return getComparisonRows(getParentRow(treeCellColumnIndex, r1, rows), r2);
                    }

                    return getComparisonRows(r1, getParentRow(treeCellColumnIndex, r2, rows));
                };

                const [r1, r2] = getComparisonRows(row1.original, row2.original);

                if (r1 && r2) {
                    const c1 = r1[columnIndex] as TableCommonCell;
                    const c2 = r2[columnIndex] as TableCommonCell;

                    if (c1 !== c2) {
                        sortComparisonValue = (c1?.value || '') > (c2?.value || '') ? 1 : -1;
                    }
                }
            } else if (column1 !== column2) {
                sortComparisonValue = (column1?.value || '') > (column2?.value || '') ? 1 : -1;
            }
        }

        return sortComparisonValue;
    };
}
