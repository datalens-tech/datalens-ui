import {Page} from '@playwright/test';

import {slct, fillDatePicker} from '../../utils';
import {Operations, RelativeDatepickerQa} from '../../../src/shared';
import {SCALES} from '../../../src/shared/constants/datepicker/relative-datepicker';

export default class FilterEditor {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async selectFilterOperation(operation: Operations) {
        await this.page.click(slct('operation-select'));

        await this.page.click(slct(operation));
    }

    async setInputValue(value: string) {
        const input = this.page.locator('.dl-dialog-filter__body .g-text-input__control');
        await input.fill(value);
    }

    async selectDate(dateValue: string) {
        await fillDatePicker({
            page: this.page,
            selector: '.dl-dialog-filter__body .g-text-input__control',
            value: dateValue,
        });
    }

    async selectRangeDate(dateValue: [string | null, string]) {
        const startDate = dateValue[0];
        const endDate = dateValue[1];

        if (startDate) {
            await fillDatePicker({
                page: this.page,
                selector: `${slct('datepicker-start')} input`,
                value: startDate,
            });
        }

        await fillDatePicker({
            page: this.page,
            selector: `${slct('datepicker-end')} input`,
            value: endDate,
        });
    }

    async selectRadio(value: string) {
        await this.page
            .locator('.dl-dialog-filter__body')
            .locator(`.g-segmented-radio-group__option`, {hasText: value})
            .click();
    }

    async selectValues(fields: string[]) {
        for (const field of fields) {
            await this.page.fill(
                `.dl-dialog-filter__select-column_left .g-list__filter input`,
                field,
            );

            await this.page.click(`.dl-dialog-filter__select-column-item >> text=${field}`);
        }
    }

    async selectRelativeDate({
        type,
        period,
        value,
    }: {
        type: 'start' | 'end';
        period?: (typeof SCALES)[keyof typeof SCALES];
        value?: string;
    }) {
        await this.page.click(`${slct(`relative-radio-buttons-${type}`)} [value=relative]`);

        if (period) {
            const selector =
                type === 'start'
                    ? RelativeDatepickerQa.ScaleSelectStart
                    : RelativeDatepickerQa.ScaleSelectEnd;
            await this.page.click(`${slct(selector)}`);
            await this.page.click(slct(period));
        }

        if (value) {
            await this.page.fill(`${slct(`amount-input-${type}`)} .g-text-input__control`, value);
        }
    }

    async apply() {
        await this.page.click('.g-dialog-footer__button_action_apply');
    }

    async openFilterField(filterField: string, placeholder?: string) {
        const parentSelector = placeholder ? slct(placeholder) : '';

        await this.page.click(`${parentSelector} ${slct(filterField)} .item-icon`);
    }

    async getSelectedValues() {
        const items = await this.page.$$(
            '.dl-dialog-filter__select-column_right .dl-dialog-filter__select-column-item-label',
        );

        return await Promise.all(items.map((item) => item.textContent()));
    }

    async isReadOnly() {
        const dialogFooterButtonSelector = '.dl-dialog-filter .g-dialog-footer .g-button';

        await this.page.waitForSelector(dialogFooterButtonSelector);

        const buttons = await this.page.$$(dialogFooterButtonSelector);

        return buttons.length === 1;
    }
}
