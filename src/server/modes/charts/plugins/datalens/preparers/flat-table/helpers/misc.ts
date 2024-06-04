import type {ServerField} from '../../../../../../../../shared';
import {findIndexInOrder, isTableBarsSettingsEnabled} from '../../../utils/misc-helpers';
import type {PrepareFunctionDataRow, ResultDataOrder} from '../../types';

export const getColumnValuesByColumnWithBarSettings = ({
    idToTitle,
    order,
    columns,
    values,
    totals,
}: {
    values: PrepareFunctionDataRow[];
    totals: PrepareFunctionDataRow;
    idToTitle: Record<string, string>;
    columns: ServerField[];
    order: ResultDataOrder;
}) => {
    const columnsWithBarSettings = columns.filter((column) => isTableBarsSettingsEnabled(column));

    return columnsWithBarSettings.reduce(
        (acc, column) => {
            const columnDataTitle = idToTitle[column.guid] || column.title;
            const indexInOrder = findIndexInOrder(order, column, columnDataTitle);

            const data = values.reduce((acc, row) => {
                const value = row[indexInOrder];
                acc.push(value);
                return acc;
            }, [] as PrepareFunctionDataRow);

            if (totals && totals.length && column.barsSettings?.showBarsInTotals) {
                const totalValue = totals[indexInOrder];

                data.push(totalValue);
            }

            acc[column.guid] = data;

            return acc;
        },
        {} as Record<string, PrepareFunctionDataRow>,
    );
};
