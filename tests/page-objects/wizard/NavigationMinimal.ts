import {Page} from '@playwright/test';

import {slct} from '../../utils';
import {CommonSelectors} from '../constants/common-selectors';
import {NavigationMinimalPlaceSelectQa} from '../../../src/shared';

export enum Ownership {
    All = 'all',
    OnlyMine = 'onlyMine',
}

class NavigationMinimal {
    private page: Page;
    private filters = '.dl-core-navigation__filters';

    constructor(page: Page) {
        this.page = page;
    }

    async clickToItem(item: string) {
        await this.page.waitForSelector(slct('navigation-minimal', item));
        await this.page.click(slct('navigation-minimal', item));
    }

    async typeToSearch(value: string) {
        await this.page.fill(
            `${slct('navigation-minimal')} .dl-core-navigation-search input`,
            value,
        );
    }

    async selectNamespace(value: NavigationMinimalPlaceSelectQa) {
        await this.page.click(
            `${slct('navigation-minimal')} ${slct('navigation-minimal-place-select')}`,
        );

        await this.page.click(slct(value));
    }

    async selectOwnership(ownership: Ownership) {
        await this.page
            .locator(this.filters)
            .locator(`${CommonSelectors.RadioButtonOptionControl}[value=${ownership}]`)
            .click();
    }
}

export default NavigationMinimal;
