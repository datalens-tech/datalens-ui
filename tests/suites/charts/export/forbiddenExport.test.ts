import {Page, expect} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    // the number of menu items of chart including separators with non-displayed export
    WIZARD_MENU_ITEMS_COUNT: 5,
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
});
