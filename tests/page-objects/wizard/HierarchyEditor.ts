import {Page} from '@playwright/test';

import {slct} from '../../utils';

import {PlaceholderName} from './SectionVisualization';

import {CommonQa} from '../constants/common-selectors';
import {HierarchyEditorQa} from '../../../src/shared';

export default class HierarchyEditor {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async openHierarchyInVisualization(placeholder: PlaceholderName, fieldName: string) {
        const container = slct(placeholder);
        const field = slct(fieldName);
        await this.page.click(`${container} ${field} .item-icon`);
    }

    async isVisible(): Promise<boolean | undefined> {
        return this.page
            .$(slct('hierarchy-editor'))
            .then((hierarchyEditor) => hierarchyEditor?.isVisible());
    }

    async setName(name: string) {
        await this.page.fill(`${slct('hierarchy-name-input')} input`, name);
    }

    async getName() {
        const input = await this.page.$(`${slct('hierarchy-name-input')} input`);
        if (!input) {
            return '';
        }
        return input.evaluate((e: HTMLInputElement) => e.value);
    }

    async selectFields(fields: string[]) {
        for (const field of fields) {
            await this.page.fill(
                `${slct(
                    'hierarchy-editor',
                )} .gc-item-selector__list:first-child .g-list__filter input`,
                field,
            );
            await this.page.hover(slct('hierarchy-editor', field));
            await this.page.click(
                `${slct('hierarchy-editor')} .g-button:visible.gc-item-selector__item-select`,
            );
        }
    }

    async clearAllSelectedFields() {
        await this.page.click(`${slct('hierarchy-editor')} .gc-item-selector__list-header button`);
    }

    getSelectedItems(): Promise<string[]> {
        return this.page
            .$$(`${slct('hierarchy-editor')} .gc-item-selector__value-item-text`)
            .then((items) => {
                return Promise.all(items.map((item) => item.innerText()));
            });
    }

    getApplyButton() {
        return this.page
            .locator(slct(HierarchyEditorQa.Dialog))
            .locator(slct(HierarchyEditorQa.ApplyButton));
    }

    async clickSave() {
        await this.getApplyButton().click();
    }

    getHierarchyNameError() {
        return this.page
            .locator(slct(HierarchyEditorQa.Dialog))
            .locator(slct(CommonQa.ControlErrorMessage));
    }

    isApplyButtonDisabled() {
        return this.page.$(slct('dialog-apply-button')).then((button) => button!.isDisabled());
    }
}
