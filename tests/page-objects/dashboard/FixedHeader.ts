import {Page} from '@playwright/test';
import {slct} from '../../utils';
import {FixedHeaderQa} from '../../../src/shared';

export class FixedHeader {
    static selectors = {
        expandCollapseButton: slct(FixedHeaderQa.ExpandCollapseFixedHeaderButton),
        staticFixedHeaderGroupWrapper: slct(FixedHeaderQa.StaticFixedHeaderGroupWrapper),
        staticFixedHeaderGroupContent: slct(FixedHeaderQa.StaticFixedHeaderGroupContent),
        hidableFixedHeaderGroupWrapper: slct(FixedHeaderQa.HidableFixedHeaderGroupWrapper),
        hidableFixedHeaderGroupContent: slct(FixedHeaderQa.HidableFixedHeaderGroupContent),
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

    get staticFixedHeaderGroupContent() {
        return this.page.locator(FixedHeader.selectors.staticFixedHeaderGroupContent);
    }

    get hidableFixedHeaderGroupContent() {
        return this.page.locator(FixedHeader.selectors.hidableFixedHeaderGroupContent);
    }

    get staticFixedHeaderGroupWrapper() {
        return this.page.locator(FixedHeader.selectors.staticFixedHeaderGroupWrapper);
    }

    get hidableFixedHeaderGroupWrapper() {
        return this.page.locator(FixedHeader.selectors.hidableFixedHeaderGroupWrapper);
    }

    async getStaticFixedHeaderGroupVerticalOffset() {
        return (
            (
                await this.page
                    .locator(FixedHeader.selectors.staticFixedHeaderGroupWrapper)
                    .boundingBox()
            )?.y ?? 0
        );
    }

    async getHidableFixedHeaderGroupVerticalOffset() {
        return (
            (
                await this.page
                    .locator(FixedHeader.selectors.hidableFixedHeaderGroupWrapper)
                    .boundingBox()
            )?.y ?? 0
        );
    }
}
