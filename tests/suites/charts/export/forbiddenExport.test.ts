import {Page, expect} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsEditorUrls, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import EditorPage from 'page-objects/editor/EditorPage';

const PARAMS = {
    CHART_TITLE: 'ForbiddenExport test',
    // the number of menu items of chart including separators with non-displayed export
    WIZARD_MENU_ITEMS_COUNT: 5,
    EDITOR_MENU_ITEMS_COUNT: 7,
};

datalensTest.describe('Chart with forbidden export', () => {
    datalensTest(
        'There is no extra export menu item in wizard chart on connection with forbidden export',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithForbiddenExport);
            await wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.chartkit.openChartMenu();

            const menuItemsCount = await page
                .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                .count();

            expect(menuItemsCount).toEqual(PARAMS.WIZARD_MENU_ITEMS_COUNT);
        },
    );
    datalensTest(
        'There is no extra export menu item in editor chart on connection with forbidden export',
        async ({page}: {page: Page}) => {
            const editorPage = new EditorPage({page});
            await openTestPage(page, RobotChartsEditorUrls.ChartWithForbiddenExport);
            await editorPage.drawPreview();

            await editorPage.waitForSelector(
                `${slct(ChartkitMenuDialogsQA.chartPreview)} >> text=${PARAMS.CHART_TITLE}`,
            );

            await editorPage.chartkit.openChartMenu();

            const menuItemsCount = await page
                .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                .count();

            expect(menuItemsCount).toEqual(PARAMS.EDITOR_MENU_ITEMS_COUNT);
        },
    );
});
