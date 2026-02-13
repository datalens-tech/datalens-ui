import {Page} from '@playwright/test';
import {ChartkitMenuDialogsQA, ChartKitQa, WizardPageQa} from '../../../../src/shared/constants';

import {CHARTKIT_MENU_ITEMS_SELECTORS} from '../../../page-objects/wizard/ChartKit';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Chart inspector', () => {
    datalensTest(
        'Clicking on the Inspector menu opens the modal with the rendered time',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithComments);

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));
            const chart = preview.locator('.chartkit-graph,.gcharts-chart');

            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toBeVisible();

            // click on the Inspector menu
            await wizardPage.chartkit.clickMenuItem(CHARTKIT_MENU_ITEMS_SELECTORS.inspectorQA);

            // check that the rendering time is not empty
            const renderTimeLocator = page
                .locator(slct(ChartkitMenuDialogsQA.chartMenuInspectorRenderTime))
                .locator(slct(ChartkitMenuDialogsQA.chartMenuInspectorNotEmpty));
            await expect(renderTimeLocator).toBeVisible();
        },
    );
});
