import {Page} from '@playwright/test';

import {slct} from '../../utils';
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

    async selectDate(dateValue: string) {
        await this.page.fill('.dl-dialog-filter__body .yc-text-input__control', dateValue);

        await this.page.keyboard.press('Enter');
    }

    async selectRangeDate(dateValue: [string | null, string]) {
        const startDate = dateValue[0];
        const endDate = dateValue[1];

        const closeDatepickerPopup = () => {
            // position is needed just for click on the left corner of container
            return this.page.click('.dl-dialog-filter__body', {position: {x: 0, y: 0}});
        };

        if (startDate) {
            await this.page.fill(
                `.dl-dialog-filter__body ${slct('datepicker-start')} .yc-text-input__control`,
                startDate,
            );
        }

        await closeDatepickerPopup();

        await this.page.fill(
            `.dl-dialog-filter__body ${slct('datepicker-end')} .yc-text-input__control`,
            endDate,
        );

        await closeDatepickerPopup();
    }

    async selectValues(fields: string[]) {
        for (const field of fields) {
            await this.page.fill(
                `.dl-dialog-filter__select-column_left .yc-list__filter input`,
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
        period?: typeof SCALES[keyof typeof SCALES];
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
            await this.page.fill(`${slct(`amount-input-${type}`)} .yc-text-input__control`, value);
        }
    }

    async apply() {
        await this.page.click('.yc-dialog-footer__button_action_apply');
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
        const dialogFooterButtonSelector = '.dl-dialog-filter .yc-dialog-footer .yc-button';

        await this.page.waitForSelector(dialogFooterButtonSelector);

        const buttons = await this.page.$$(dialogFooterButtonSelector);

        return buttons.length === 1;
    }
}
