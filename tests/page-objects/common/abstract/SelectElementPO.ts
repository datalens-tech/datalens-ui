import {slct} from '../../../utils';

import {ListItemByParams} from '../../types';
import {ElementPO} from './ElementPO';
import {SelectQa} from '@gravity-ui/uikit';

export class SelectElementPO extends ElementPO {
    static selectors = {
        qa: {
            popup: slct(SelectQa.POPUP),
            list: slct(SelectQa.LIST),
        },
    };

    getListLocator() {
        return this.page.locator(
            `${SelectElementPO.selectors.qa.popup} ${SelectElementPO.selectors.qa.list}`,
        );
    }

    async expectListVisible() {
        await expect(this.getListLocator()).toBeVisible();
    }

    async selectListItem({idx, innerText}: ListItemByParams) {
        if (innerText !== undefined) {
            await this.selectListItemByName(innerText);
        } else if (typeof idx === 'number') {
            await this.selectListItemByIdx(idx);
        }
    }

    async selectListItemByQa(qaSelector: string) {
        await this.expectListVisible();
        await this.getListLocator().locator(qaSelector).click();
    }

    async selectListItemByIdx(idx: number) {
        await this.expectListVisible();
        await this.getListLocator().getByRole('option').nth(idx).click();
    }

    async selectListItemByName(name: string) {
        await this.expectListVisible();
        await this.getListLocator().getByRole('option').filter({hasText: name}).click();
    }
}
