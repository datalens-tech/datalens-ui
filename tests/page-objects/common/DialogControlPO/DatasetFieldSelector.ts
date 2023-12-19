import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {ListItemByParams} from '../../../page-objects/types';

export class DatasetFieldSelector {
    static selectors = {
        qa: {
            root: slct(DialogControlQa.fieldSelect),
            popup: slct('select-popup'),
            list: slct('select-list'),
        },
    };

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getListLocator() {
        return this.page.locator(
            `${DatasetFieldSelector.selectors.qa.popup} ${DatasetFieldSelector.selectors.qa.list}`,
        );
    }

    async expectVisible() {
        await expect(this.page.locator(DatasetFieldSelector.selectors.qa.root)).toBeVisible();
    }

    async waitForVisible() {
        await this.page.waitForSelector(DatasetFieldSelector.selectors.qa.root);
    }

    async expectListVisible() {
        await expect(this.getListLocator()).toBeVisible();
    }

    async click() {
        await this.expectVisible();
        await this.page.locator(DatasetFieldSelector.selectors.qa.root).click();
    }

    async selectListItem({idx}: ListItemByParams) {
        if (typeof idx === 'number') {
            await this.selectListItemByIdx(idx);
        }
    }

    async selectListItemByIdx(idx: number) {
        await this.expectListVisible();
        await this.getListLocator().getByRole('option').nth(idx).click();
    }
}
