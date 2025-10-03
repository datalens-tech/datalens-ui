import type {IChartEditor, MarkupItem} from '../../../../../../../../shared';
import {isMarkupItem, markupToRawString} from '../../../../../../../../shared';
import type {CharkitTableHead, ChartkitTableRows, PivotDataRowsHeader, PivotField} from '../types';

export const isRowWithTotals = (
    headers: PivotDataRowsHeader[],
    fieldsItemIdMap: Record<string, PivotField>,
) => {
    return headers.some((header) => {
        if (!header) {
            return false;
        }
        const [_value, legendItemId] = header[0];

        return fieldsItemIdMap[legendItemId]?.item_type === 'placeholder';
    });
};

export const setTotalsHeadersToRows = (rows: ChartkitTableRows, i18n: (key: string) => string) => {
    rows.forEach((row: {cells: any[]}) => {
        let isTotalHeaderSet = false;

        row.cells.forEach((cell, index) => {
            if (cell.isTotalCell && cell.value === '' && !isTotalHeaderSet) {
                isTotalHeaderSet = true;

                const totalTitle = i18n('label_total');

                const prevCell = row.cells[index - 1];

                if (prevCell) {
                    if (isMarkupItem(prevCell.value)) {
                        const markupValue: MarkupItem = {
                            type: 'concat',
                            children: [{type: 'text', content: `${totalTitle} `}, prevCell.value],
                        };
                        cell.value = markupValue;
                    } else {
                        cell.value = `${totalTitle} ${prevCell.value}`;
                        cell.type = 'text';
                    }
                } else {
                    cell.value = totalTitle;
                    cell.type = 'text';
                }
            }
        });
    });
};

export const setTotalsHeadersToHead = (
    head: CharkitTableHead,
    i18n: (key: string) => string,
    parentName?: string | null | MarkupItem,
) => {
    for (let i = 0; i < head.length; i++) {
        const headItem = head[i];
        if (headItem.isTotalCell) {
            const totalTitle = i18n('label_total');
            if (parentName) {
                const isParentMarkup = typeof parentName === 'object' && 'content' in parentName;

                const parentCellValue = isParentMarkup ? markupToRawString(parentName) : parentName;

                headItem.name = `${totalTitle} ${parentCellValue}`;
            } else {
                headItem.name = totalTitle;
            }
            break;
        }

        const children = headItem.sub;

        if (children && children.length) {
            setTotalsHeadersToHead(children, i18n, headItem.name);
        }
    }
};

export const setTotalsHeaders = (
    {rows, head}: {rows: ChartkitTableRows; head: CharkitTableHead},
    ChartEditor: IChartEditor,
) => {
    const i18n = (key: string) => ChartEditor.getTranslation('wizard.prepares', key);

    setTotalsHeadersToHead(head, i18n);
    setTotalsHeadersToRows(rows, i18n);
};

export const getGrandTotalsRowIndex = (rows: ChartkitTableRows) => {
    let totalRowIndex = -1;
    // Since totals are always at the end of lines.
    // Find the first non-total header, and then save the previous index as the first index of the total rows
    for (let i = rows.length - 1; i >= 0; i--) {
        const prevIndex = i + 1;
        const row = rows[i];
        const prevRow = rows[prevIndex];
        const firstCell = row.cells[0];
        const prevFirstCell = prevRow?.cells[0];

        if (prevFirstCell && prevFirstCell.isTotalCell && !firstCell.isTotalCell) {
            totalRowIndex = prevIndex;
            break;
        }
    }

    return totalRowIndex;
};
