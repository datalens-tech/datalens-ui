import {Page} from '@playwright/test';
import {DialogParameterQA} from '../../../src/shared/constants';

import {slct, waitForCondition} from '../../utils';

export enum DialogParameterDataTypes {
    String = 'string',
    Date = 'date',
    Datetime = 'datetime',
    Float = 'float',
    Boolean = 'boolean',
    Int = 'integer',
}

export default class DialogParameter {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async waitForDialogParameter() {
        return await waitForCondition(async () => {
            return this.page.$(slct(DialogParameterQA.Dialog));
        });
    }

    async setName(name: string) {
        await this.waitForDialogParameter();
        await this.page.fill(`${slct(DialogParameterQA.NameInput)} input`, name);
    }

    async setDefaultValue(value: string) {
        await this.waitForDialogParameter();
        await this.page.fill(`${slct(DialogParameterQA.DefaultValueInput)} input`, value);
    }

    async setDefaultValueBoolean(value: 'true' | 'false') {
        await this.waitForDialogParameter();
        await this.page.click(
            `${slct(DialogParameterQA.DefaultValueRadioGroup)} input[value="${value}"]`,
        );
    }

    async selectType(type: DialogParameterDataTypes) {
        await this.waitForDialogParameter();
        await this.page.click(slct(DialogParameterQA.TypeSelector));
        await this.page.click(slct(`dialog-parameter-${type}`));
    }

    async apply() {
        await this.page.click(slct(DialogParameterQA.Apply));
    }
}
