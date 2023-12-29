import {Page} from '@playwright/test';

import {ElementPOProps, ElementSelectors} from './types';

export class ElementPO {
    page: Page;
    selectors: ElementSelectors;

    constructor({page, selectors}: ElementPOProps) {
        this.page = page;
        this.selectors = selectors;
    }

    getSelector() {
        return this.selectors.parent
            ? `${this.selectors.parent} ${this.selectors.root}`
            : this.selectors.root;
    }

    getLocator() {
        return this.page.locator(this.getSelector());
    }

    async expectVisible() {
        await expect(this.getLocator()).toBeVisible();
    }

    async waitForVisible() {
        await this.getLocator().waitFor({state: 'visible'});
    }

    async click() {
        await this.expectVisible();
        await this.getLocator().click();
    }
}
