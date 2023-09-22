import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard Fields', () => {
    datalensTest('Moving fields via drag and drop and saving', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.sectionVisualization.addFieldByDragAndDrop(PlaceholderName.Y, 'City');

        await wizardPage.sectionVisualization.addFieldByDragAndDrop(PlaceholderName.X, 'Rank');

        await page.waitForTimeout(5000);

        await wizardPage.chartkit.waitUntilLoaderExists();

        await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName('test-wizard-chart'));

        await wizardPage.deleteEntry();
    });

    datalensTest('Moving fields through the add and save button', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'City');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Rank');

        await page.waitForTimeout(5000);

        await wizardPage.chartkit.waitUntilLoaderExists();

        await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName('test-wizard-chart'));

        await wizardPage.deleteEntry();
    });
});
