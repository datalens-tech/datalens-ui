import block from 'bem-cn-lite';

import type {CellData, TData} from '../types';

import type {CellContentWidth} from './types';

const b = block('dl-table');

type UseCellContentWidthArgs = {
    rootElement: Element | null;
    rows?: TData[];
};

export const useCellContentWidth = (args: UseCellContentWidthArgs): CellContentWidth[] => {
    const {rootElement, rows} = args;

    if (!rows || !rootElement) {
        return [];
    }

    const [container, fakeCellContent] = createContainer();
    const result = new Array(rows.length).fill(null).map(() => ({minWidth: 0, maxWidth: 0}));
    rows.forEach((cells) => {
        cells.forEach((cell, colIndex) => {
            const {minWidth, maxWidth} = getCellContentSize(cell, fakeCellContent);
            result[colIndex].minWidth = Math.max(result[colIndex].minWidth, minWidth);
            result[colIndex].maxWidth = Math.max(result[colIndex].maxWidth, maxWidth);
        });
    });
    container.remove();

    return result;
};

const symbolSize = new Map<string, number>();

function getCellContentSize(cell: CellData, wrapper: HTMLElement): CellContentWidth {
    const result: CellContentWidth = {
        minWidth: 0,
        maxWidth: 0,
    };

    const text = String(cell.value);
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let charWidth = symbolSize.get(char);
        if (typeof charWidth === 'undefined') {
            wrapper.innerText = char;
            charWidth = wrapper.getBoundingClientRect().width as number;
            symbolSize.set(char, charWidth);
        }

        result.minWidth += charWidth;
        result.maxWidth += charWidth;
    }

    return result;
}

function createContainer() {
    const table = document.createElement('table');
    table.setAttribute('class', 'chartkit chartkit-theme_common');
    table.innerHTML = `<tbody class="${b('body')}"><tr class="${b('tr')}"><td class="${b('td')}"></td></tr></tbody>`;
    document.body.append(table);
    const cell = table.rows[0].cells[0];
    const content = document.createElement('span');
    cell.append(content);

    return [table, content];
}
