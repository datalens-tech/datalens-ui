import {Page} from '@playwright/test';

import {slct} from '../../utils';
import {CommonSelectors} from '../constants/common-selectors';
import {DialogLinkQa} from '../../../src/shared';

export class LinkDialog {
    private dialogLinkSelector = slct('dialog-link');
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async selectFieldForLink(datasetName: string, field: string) {
        await this.page.click(`${this.dialogLinkSelector} ${slct(datasetName)}`);

        await this.page.click(`${CommonSelectors.SelectItem} >> text=${field}`);
    }

    async getValueFromSelector(datasetName: string) {
        const node = await this.page.$(`${slct(datasetName)}`);
        return node ? node.textContent() : null;
    }

    async apply() {
        await this.page.click(slct(DialogLinkQa.ApplyButton));
    }
}
