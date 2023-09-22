import {Page} from '@playwright/test';
import {DatasetTabSectionQA} from '../../../src/shared/constants';

import {slct} from '../../utils';

export default class DatasetTabSection {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async clickAddButton() {
        await this.page.click(slct(DatasetTabSectionQA.AddButton));
    }

    async getRowsCount() {
        const rows = await this.page.$$(slct(DatasetTabSectionQA.FieldRow));

        return rows.length;
    }

    async getRowLocatorByIndex(index: number) {
        const locator = this.page.locator(slct(DatasetTabSectionQA.FieldRow));
        return locator.nth(index);
    }

    async hoverOnRow(index: number) {
        const rowLocator = this.page.locator(slct(DatasetTabSectionQA.FieldRow));
        await rowLocator.nth(index).hover();
    }

    async clickOnRowMenu(index: number) {
        const menuLocator = this.page.locator(slct(DatasetTabSectionQA.FieldRowMenu));
        await menuLocator.nth(index).click();
    }

    async openRowMenu(index: number) {
        await this.hoverOnRow(index);
        await this.clickOnRowMenu(index);
    }

    async deleteRow(index: number) {
        await this.openRowMenu(index);
        await this.page.click(slct(DatasetTabSectionQA.RemoveRow));
    }

    async duplicateRow(index: number) {
        await this.openRowMenu(index);
        await this.page.click(slct(DatasetTabSectionQA.DuplicateRow));
    }

    async editRow(index: number) {
        await this.openRowMenu(index);
        await this.page.click(slct(DatasetTabSectionQA.EditRow));
    }
}
