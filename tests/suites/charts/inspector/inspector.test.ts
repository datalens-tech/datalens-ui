import {Page} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import {CHARTKIT_MENU_ITEMS_SELECTORS} from '../../../page-objects/wizard/ChartKit';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Chart inspector', () => {
    datalensTest.skip(
        'Clicking on the Inspector menu opens the modal with the rendered time',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithComments);
            await wizardPage.waitForSuccessfulResponse('/api/run');

            // click on the Inspector menu
            await wizardPage.chartkit.clickMenuItem(CHARTKIT_MENU_ITEMS_SELECTORS.inspectorQA);

            // check that the rendering time is not empty
            await wizardPage.waitForSelector(
                `${slct(ChartkitMenuDialogsQA.chartMenuInspectorRenderTime)} ${slct(
                    ChartkitMenuDialogsQA.chartMenuInspectorNotEmpty,
                )}`,
            );
        },
    );
});
