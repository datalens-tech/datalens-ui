import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    ChartKitQa,
    Operations,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {SMALL_SCREENSHOT_VIEWPORT_SIZE} from '../constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Bar-y chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.BarYD3);
        });

        datalensTest('Sorting by X field', async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.createNewFieldWithFormula('y', 'str([id])');
            await wizardPage.createNewFieldWithFormula('x', 'max([id])');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'id');
            await wizardPage.filterEditor.selectFilterOperation(Operations.LTE);
            await wizardPage.filterEditor.setInputValue('5');
            await wizardPage.filterEditor.apply();

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'y');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'x');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, 'x');

            await expect(previewLoader).not.toBeVisible();

            await expect(preview).toHaveScreenshot();
        });
    });
});
