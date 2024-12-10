import {Page} from '@playwright/test';
import {slct} from '../../utils';
import {FixedHeaderQa} from '../../../src/shared';

export class FixedHeader {
    static selectors = {
        expandCollapseButton: slct(FixedHeaderQa.ExpandCollapseButton),
        wrapper: slct(FixedHeaderQa.Wrapper),
        controls: slct(FixedHeaderQa.Controls),
        container: slct(FixedHeaderQa.Container),
    };

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    get expandCollapseButton() {
        return this.page.locator(FixedHeader.selectors.expandCollapseButton);
    }

    toggleFixedHeaderCollapsibleState() {
        return this.page.locator(FixedHeader.selectors.expandCollapseButton).click();
    }

    get controls() {
        return this.page.locator(FixedHeader.selectors.controls);
    }

    get container() {
        return this.page.locator(FixedHeader.selectors.container);
    }

    async getWrapperVerticalOffset() {
        return (await this.page.locator(FixedHeader.selectors.wrapper).boundingBox())?.y ?? 0;
    }
}
