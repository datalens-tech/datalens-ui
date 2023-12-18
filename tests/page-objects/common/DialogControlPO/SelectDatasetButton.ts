import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {NavigationMinimalPopup} from 'page-objects/workbook/NavigationMinimalPopup';

export class SelectDatasetButton {
    static selectors = {
        qa: {
            root: slct(DialogControlQa.selectDatasetButton),
        },
    };

    navigationMinimal: NavigationMinimalPopup;

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
        this.navigationMinimal = new NavigationMinimalPopup(page);
    }

    async expectVisible() {
        await expect(this.page.locator(SelectDatasetButton.selectors.qa.root)).toBeVisible();
    }

    async waitForVisible() {
        await this.page.waitForSelector(SelectDatasetButton.selectors.qa.root);
    }

    async click() {
        await this.expectVisible();
        await this.page.locator(SelectDatasetButton.selectors.qa.root).click();
    }
}
