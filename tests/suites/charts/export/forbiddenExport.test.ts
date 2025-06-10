import {Page, expect} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {MenuItemsIds} from '../../../../src/shared';

const PARAMS = {
    // the number of menu items of chart including separators with non-displayed export
    WIZARD_MENU_ITEMS_COUNT: 6,
};

datalensTest.describe('Chart with forbidden export', () => {
    datalensTest(
        'Export menu item is disabled in wizard chart on connection with forbidden export',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithForbiddenExport);
            await wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.chartkit.openChartMenu();

            const menuItemsCount = await page
                .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                .count();

            const exportMenuItem = await page.locator(slct(MenuItemsIds.EXPORT));

            expect(menuItemsCount).toEqual(PARAMS.WIZARD_MENU_ITEMS_COUNT);
            expect(exportMenuItem.getAttribute('tabindex')).toBe('-1');
        },
    );
});
