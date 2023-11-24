import {Page} from '@playwright/test';
import {slct} from 'utils';
import {CreateEntityButton} from '../../../src/shared';

export class CreateEntryButton {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async waitForVisible() {
        await this.page.waitForSelector(slct(CreateEntityButton.Button));
    }

    async click() {
        await this.page.click(slct(CreateEntityButton.Button));
    }

    async waitForPopupOpen() {
        await this.page.waitForSelector(slct(CreateEntityButton.Popup));
    }

    async performCreateDashboard() {
        await this.click();
        await this.waitForPopupOpen();
        await this.page
            .locator(`${slct(CreateEntityButton.Popup)} li`)
            .filter({has: this.page.getByText('Dashboard')})
            .click();
    }
}
