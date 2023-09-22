import {Page} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import {CHARTKIT_MENU_ITEMS_SELECTORS} from '../../../page-objects/wizard/ChartKit';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Chart - share', () => {
    datalensTest('Clicking on the Share menu opens the modal', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});
        await openTestPage(page, RobotChartsWizardUrls.WizardWithComments);

        // click on the Share menu
        await wizardPage.chartkit.clickMenuItem(CHARTKIT_MENU_ITEMS_SELECTORS.shareQA);

        // check that the modal content has been rendered
        await wizardPage.waitForSelector(slct(ChartkitMenuDialogsQA.chartMenuShareModalBody));
    });
});
