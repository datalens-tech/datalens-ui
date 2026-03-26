import {Page} from '@playwright/test';
import {DialogLineShapesQa, LineShapeType} from '../../../src/shared/constants';

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

    private cancelButton = '.dialog-line-shapes .g-dialog-footer__button_action_cancel';
    private applyButton = '.dialog-line-shapes .g-dialog-footer__button_action_apply';

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

    async selectValue(value: string) {
        await this.page
            .locator(slct(DialogLineShapesQa.ValueList))
            .locator(`[title='${value}']`)
            .click();
    }
}
