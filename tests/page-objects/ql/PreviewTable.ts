import {Page} from '@playwright/test';

export default class PreviewTable {
    static slct() {
        return '.ql-pane-table-preview';
    }

    private page: Page;

    private tableRowSelector = `${PreviewTable.slct()} .data-table .data-table__row`;
    private tableHeadSelector = `${PreviewTable.slct()} .data-table .data-table__head-row`;

    constructor(page: Page) {
        this.page = page;
    }

    async getRowsTexts() {
        const rows = await this.getRowContent(this.tableRowSelector, '.data-table__td', 'text');

        return rows.map((row) => {
            return row.map((rowValue) => rowValue.replace(/\u00a0/g, ' '));
        });
    }

    async getHeadRowsTexts() {
        const rows = await this.getRowContent(this.tableHeadSelector, '.data-table__th', 'text');

        return rows.map((row) => {
            return row.map((rowValue) => rowValue.replace(/\u00a0/g, ' '));
        });
    }

    private async getRowContent(
        rowSelector: string,
        cellSelector: string,
        contentType: 'text' | 'html',
    ) {
        await this.page.waitForSelector(rowSelector);

        const rowElements = await this.page.$$(rowSelector);

        return Promise.all(
            rowElements.map(async (row) => {
                const cells = await row.$$(cellSelector)!;

                const cellsTexts = await Promise.all(
                    cells.map((cell) => {
                        if (contentType === 'text') {
                            return cell.innerText();
                        }

                        return cell.innerHTML();
                    }),
                );

                return cellsTexts.map((cellText: string) => cellText.trim());
            }),
        );
    }
}
