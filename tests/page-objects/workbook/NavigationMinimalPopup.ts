import {Page} from '@playwright/test';
import {slct} from '../../utils';
import {WorkbookNavigationMinimalQa} from '../../../src/shared';
import {ListItemByParams} from '../../page-objects/types';

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

    async selectListItem({innerText, idx}: ListItemByParams) {
        await this.waitForOpen();
        if (innerText) {
            await this.fillInput(innerText);
            await this.page.waitForSelector(
                `${this.slctPopup} ${this.slctList} ${slct(innerText)}`,
            );
            await this.page.click(`${this.slctPopup} ${this.slctList} ${slct(innerText)}`);
        } else if (typeof idx === 'number') {
            await this.selectListItemByIdx(idx);
        }
    }

    async selectListItemByIdx(idx: number) {
        await this.page
            .locator(`${this.slctPopup} ${this.slctList}`)
            .getByRole('listitem')
            .nth(idx)
            .click();
    }
}
