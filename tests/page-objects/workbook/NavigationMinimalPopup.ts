import {Page} from '@playwright/test';
import {slct} from '../../utils';
import {WorkbookNavigationMinimalQa} from '../../../src/shared';

export class NavigationMinimalPopup {
    slctPopup = slct(WorkbookNavigationMinimalQa.Popup);
    slctInput = slct(WorkbookNavigationMinimalQa.Input);
    slctList = slct(WorkbookNavigationMinimalQa.List);

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async waitForOpen() {
        await this.page.waitForSelector(this.slctPopup);
    }

    async isVisible() {
        await this.page.isVisible(this.slctPopup);
    }

    async clickInput() {
        await this.page.click(`${this.slctPopup} ${this.slctInput} input`);
    }

    async fillInput(value: string) {
        await this.page.fill(`${this.slctPopup} ${this.slctInput} input`, value);
    }

    async selectListItem(name: string) {
        await this.waitForOpen();
        await this.fillInput(name);
        await this.page.waitForSelector(`${this.slctPopup} ${this.slctList} ${slct(name)}`);
        await this.page.click(`${this.slctPopup} ${this.slctList} ${slct(name)}`);
    }
}
