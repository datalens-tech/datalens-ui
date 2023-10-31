import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {E2EWizardUrls, WizardDatasetNames} from '../../../utils/opensource/constants/wizard';
import {
    deleteWorkbookEntry,
    openOpensourceTestPage,
    saveWorkbookEntry,
} from '../../../utils/opensource/helpers';
import {WorkbookNavigationMinimal} from '../../../page-objects/wizard/WorkbookNavigationMinimal';
import {SaveChartControlsQa} from '../../../../src/shared';
import {DEFAULT_WORKBOOK_ID} from '../../../utils/opensource/constants/common';

datalensTest.describe('Wizard Fields', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});
        const workbookNavigationMinimal = new WorkbookNavigationMinimal({page});

        await openOpensourceTestPage(page, E2EWizardUrls.Empty, {workbookId: DEFAULT_WORKBOOK_ID});

        await wizardPage.datasetSelector.click();

        await workbookNavigationMinimal.inputFilter(WizardDatasetNames.Dataset);

        await workbookNavigationMinimal.clickOnItem(WizardDatasetNames.Dataset);
    });

    datalensTest('Moving fields via drag and drop and saving', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByDragAndDrop(PlaceholderName.Y, 'sales');

        await wizardPage.sectionVisualization.addFieldByDragAndDrop(PlaceholderName.X, 'city');

        await page.waitForTimeout(5000);

        await wizardPage.chartkit.waitUntilLoaderExists();

        await saveWorkbookEntry(
            page,
            SaveChartControlsQa.SaveButton,
            wizardPage.getUniqueEntryName('test-wizard-chart'),
        );

        await deleteWorkbookEntry(page);
    });

    datalensTest('Moving fields through the add and save button', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'sales');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'city');

        await page.waitForTimeout(5000);

        await wizardPage.chartkit.waitUntilLoaderExists();

        await saveWorkbookEntry(
            page,
            SaveChartControlsQa.SaveButton,
            wizardPage.getUniqueEntryName('test-wizard-chart'),
        );

        await deleteWorkbookEntry(page);
    });
});
