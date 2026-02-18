import {expect, Page} from '@playwright/test';

import {slct} from '../../utils';
import {DialogFieldEditorQA, FieldEditorQa, SectionDatasetQA} from '../../../src/shared';

export default class FieldEditor {
    static slct(childSelector: string) {
        return `${slct(FieldEditorQa.Dialog)} ${childSelector}`;
    }
    private fieldNameSelector = FieldEditor.slct(`${slct('field-name')} input`);
    private applyButtonSelector = slct(DialogFieldEditorQA.ApplyButton);
    private fieldEditorSelector = FieldEditor.slct('.react-monaco-editor-container');
    private fieldItemSelector = FieldEditor.slct('.g-list__item');
    private fieldNameEditBtnSelector = slct(DialogFieldEditorQA.EditNameButton);

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.page.click(slct(SectionDatasetQA.AddField));

        await this.page.click(slct(SectionDatasetQA.CreateFieldButton));
    }

    async setName(name: string) {
        await this.page.click(this.fieldNameSelector);
        await this.page.keyboard.insertText(name);
    }

    async changeName(name: string) {
        await this.page.click(this.fieldNameEditBtnSelector);
        await this.page.click(this.fieldNameSelector);
        await this.page.keyboard.press('Meta+A');
        await this.page.keyboard.press('Backspace');
        await this.page.keyboard.insertText(name);
    }

    async setFormula(formula: string) {
        await this.page.click(this.fieldEditorSelector);
        await this.page.keyboard.insertText(formula);
    }

    async clickToApplyButton() {
        await this.page.click(this.applyButtonSelector);
    }

    async selectField(field: string) {
        await this.page.waitForSelector(this.fieldEditorSelector);
        await this.page.click(`${this.fieldItemSelector} >> text=${field}`);
    }

    async checkFormula(formula: string) {
        const item = this.page.locator(`${this.fieldEditorSelector} .lines-content`);
        await expect(item).toHaveText(formula);
    }
}
