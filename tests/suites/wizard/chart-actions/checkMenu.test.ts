import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {MenuItemsQA} from '../../../../src/shared/constants';
import {openTestPage, slct} from '../../../utils';

datalensTest.describe('Wizard - chart actions', () => {
    datalensTest.beforeEach(async ({page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardFlatTable);
    });

    datalensTest(
        "Let's check that the menu has all the necessary positions for the usual saved chart",
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.chartkit.openChartMenu();

            await wizardPage.waitForSelector(slct(MenuItemsQA.EXPORT));
            await wizardPage.waitForSelector(slct(MenuItemsQA.NEW_WINDOW));
            await wizardPage.waitForSelector(slct(MenuItemsQA.GET_LINK));
            await wizardPage.waitForSelector(slct(MenuItemsQA.INSPECTOR));
            await wizardPage.waitForSelector(slct(MenuItemsQA.ALERTS));
        },
    );
});
