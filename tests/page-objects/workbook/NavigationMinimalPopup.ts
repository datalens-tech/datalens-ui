import {Page} from '@playwright/test';
import {slct} from '../../utils';
import {DlNavigationQA, WorkbookNavigationMinimalQa} from '../../../src/shared';
import {ListItemByParams} from '../../page-objects/types';

export class NavigationMinimalPopup {
    workbookSlctPopup = slct(WorkbookNavigationMinimalQa.Popup);
    workbookSlctInput = slct(WorkbookNavigationMinimalQa.Input);
    workbookSlctList = slct(WorkbookNavigationMinimalQa.List);
    navigationSlctPopup = slct(DlNavigationQA.NavigationMinimal);
    navigationSlctInput = slct(DlNavigationQA.SearchInput);
    navigationSlctList = slct(DlNavigationQA.List);

    popupLocator;
    listLocator;

    protected page: Page;

    constructor(page: Page) {
        this.page = page;

        this.popupLocator = this.page
            .locator(this.workbookSlctPopup)
            .or(this.page.locator(this.navigationSlctPopup));

        this.listLocator = this.popupLocator
            .locator(this.workbookSlctList)
            .or(this.popupLocator.locator(this.navigationSlctList));
    }

    async waitForOpen() {
        await this.popupLocator.waitFor({state: 'visible'});
    }

    async isVisible() {
        await this.popupLocator.isVisible();
    }

    async fillInput(value: string) {
        const input = this.popupLocator
            .locator(`${this.workbookSlctInput} input`)
            .or(this.popupLocator.locator(`${this.navigationSlctInput} input`));

        await input.fill(value);
    }

    async selectListItem({innerText, idx}: ListItemByParams) {
        await this.waitForOpen();
        if (innerText) {
            await this.fillInput(innerText);
            const listItem = this.listLocator.locator(slct(innerText));
            await listItem.waitFor({state: 'visible'});
            await listItem.click();
        } else if (typeof idx === 'number') {
            await this.selectListItemByIdx(idx);
        }
    }

    async selectListItemByIdx(idx: number) {
        await this.listLocator.getByRole('listitem').nth(idx).click();
    }
}
