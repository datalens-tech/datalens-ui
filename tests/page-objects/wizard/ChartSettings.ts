import {ElementHandle, Page} from '@playwright/test';

import {slct, waitForCondition} from '../../utils';
import {CommonSelectors} from '../constants/common-selectors';
import {ChartSettingsDialogQA} from '../../../src/shared';

export enum ChartSettingsItems {
    Navigator = 'navigator-switcher',
    Groupping = 'groupping-switcher',
    Pagination = 'pagination-switcher',
    TitleMode = 'title-mode-switcher',
    Totals = 'totals-switcher',
    Legend = 'legend-switcher',
    TooltipSum = 'tooltip-sum-switcher',

    PivotTableFallback = 'pivot-fallback-switcher',
}

export default class ChartSettings {
    private dialogCloseButtonSelector = '.wizard-chart-settings .g-dialog-btn-close__btn';
    private limitInputSelector = '.dialog-settings-limit-input__text-input input';
    private applyButtonSelector = '.wizard-chart-settings .g-dialog-footer__button-apply';
    private openChartSettingsSelector = slct('visualization-select-settings-btn');
    private titleInput = slct('title-input');

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.page.click(this.openChartSettingsSelector);
    }

    async close() {
        await this.page.click(this.dialogCloseButtonSelector);
    }

    async isPaginationSwitcherDisabled() {
        let classAttribute: string | null | undefined;

        await waitForCondition(async () => {
            const paginationItem = await this.page.$(slct(ChartSettingsItems.Pagination));

            classAttribute = await paginationItem?.getAttribute('class');

            return classAttribute;
        }).catch(() => {
            throw new Error('Attribute class not found in pagination selector');
        });

        return classAttribute?.includes('g-switch_disabled');
    }

    async getSettingItem(settingQa: string) {
        let settingItem: null | ElementHandle | undefined;

        await waitForCondition(async () => {
            settingItem = await this.page.$(slct(settingQa));

            return settingItem;
        }).catch(() => {
            throw new Error(`Settings was not found: ${settingItem}`);
        });

        return settingItem!;
    }

    async checkItemAttribute(settingItem: ElementHandle, expectedMode: 'on' | 'off') {
        let checkedAttribute: string | null | undefined;

        await waitForCondition(async () => {
            const inputItem = await settingItem.$('input');

            checkedAttribute = await inputItem?.getAttribute('aria-checked');

            if (checkedAttribute) {
                return expectedMode === 'on'
                    ? checkedAttribute === 'true'
                    : checkedAttribute === 'false';
            } else {
                throw new Error('Attribute responsible for checked status not found');
            }
        }).catch(() => {
            throw new Error(
                `Mode attribute ${checkedAttribute}, and expected ${
                    expectedMode === 'on' ? 'true' : 'false'
                }`,
            );
        });
    }

    async toggleSettingItem(settingQa: string, mode: 'on' | 'off') {
        const settingItem: ElementHandle = await this.getSettingItem(settingQa);

        await settingItem.click();

        await this.checkItemAttribute(settingItem, mode);
    }

    async checkSettingMode(settingQa: string, mode: 'on' | 'off') {
        const settingItem: ElementHandle = await this.getSettingItem(settingQa);

        await this.checkItemAttribute(settingItem, mode);
    }

    async getTitleValue() {
        return await this.page.locator(`${this.titleInput} input`).inputValue();
    }

    async setTitle(title: string) {
        await this.page.fill(`${this.titleInput} input`, title);
    }

    async setLimit(limit: number) {
        await this.page.fill(this.limitInputSelector, String(limit));
    }

    async setFeed(feedValue: string) {
        await this.page.fill(`${slct('feed-input')} input`, feedValue);
    }

    async setMetricFontSize(size: string) {
        const sizeOption = this.page
            .locator(slct(ChartSettingsDialogQA.IndicatorFontSize))
            .locator(CommonSelectors.RadioButtonOption, {hasText: size});

        await sizeOption.click();
    }

    async setNavigatorLinesMode(linesMode: 'all' | 'selected') {
        await this.page.click(
            `${slct('navigator-lines-mode')} ${
                CommonSelectors.RadioButtonOptionControl
            }[value=${linesMode}]`,
            {force: true},
        );
    }

    async selectLines(names: string[]) {
        // Click and open the selector
        await this.page.click(`${slct('navigator-lines-select')}`);

        for (const name of names) {
            await this.page.click(`${slct('select-list')} >> text=${name}`);
        }

        // Closing the selector, since it is a multiselect
        await this.page.click(`${slct('navigator-lines-select')}`);
    }

    async waitForSettingsRender() {
        await waitForCondition(async () => {
            return await this.page.$('.wizard-chart-settings__settings');
        });
    }
    async apply() {
        await this.page.click(this.applyButtonSelector);
    }
}
