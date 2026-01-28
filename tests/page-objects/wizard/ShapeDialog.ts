import {Page} from '@playwright/test';
import {DialogShapeSettings, LineShapeType} from '../../../src/shared/constants';

import {slct} from '../../utils';

import {PlaceholderName} from './SectionVisualization';

export const DashArrayLineType = {
    [LineShapeType.Solid]: 'none',
    [LineShapeType.Dash]: '8,6',
    [LineShapeType.Dot]: '2,6',
    [LineShapeType.LongDashDot]: '16,6,2,6',
};

export default class ShapeDialog {
    private page: Page;

    private cancelButton = '.dialog-shapes .g-dialog-footer__button_action_cancel';
    private valueLabelSelector = '.dialog-shapes .values-list__value-label';
    private applyButton = '.dialog-shapes .g-dialog-footer__button_action_apply';

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.page.hover(slct(PlaceholderName.Shapes));

        await this.page.click(slct('shapes-action-icon'));
    }

    async apply() {
        await this.page.click(this.applyButton);
    }

    async close() {
        await this.page.click(this.cancelButton);
    }

    async changeLineShapeType(lineShape: LineShapeType) {
        await this.page.click(slct(lineShape));
    }

    async clickLineWidthSelectControl() {
        await this.page
            .locator(slct(DialogShapeSettings.LineSettingsScopeTab))
            .locator(slct(DialogShapeSettings.LineWidthSelectControl))
            .click();
    }

    async changeLineWidth(width: string) {
        await this.clickLineWidthSelectControl();
        await this.page
            .locator(slct(DialogShapeSettings.LineWidthSelectOption))
            .locator(`[data-qa="${width}"]`)
            .click();
    }

    async getLineWidthSelectOptions() {
        return this.page.locator(slct(DialogShapeSettings.LineWidthSelectOption));
    }

    async getLineWidthSelectControlText() {
        const control = this.page
            .locator(slct(DialogShapeSettings.LineSettingsScopeTab))
            .locator(slct(DialogShapeSettings.LineWidthSelectControl));
        return control.textContent();
    }

    getLineWidthSelectControlLine() {
        return this.page
            .locator(slct(DialogShapeSettings.LineSettingsScopeTab))
            .locator(slct(DialogShapeSettings.LineWidthSelectControl))
            .locator('.dl-line-width-select__option-line');
    }

    async getLineWidthSelectControlLineHeight() {
        const line = this.getLineWidthSelectControlLine();
        const style = await line.getAttribute('style');
        const match = style?.match(/height:\s*(\d+)px/);
        return match ? match[1] : null;
    }

    async selectValue(value: string) {
        await this.page.waitForSelector(this.valueLabelSelector);

        await this.page.click(`[title='${value}']`);
    }
}
