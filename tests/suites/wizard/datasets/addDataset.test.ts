import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard Datasets', () => {
    datalensTest('Adding two datasets and switching between them', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.Empty);

        await wizardPage.addFirstDataset(RobotChartsDatasets.CsvBasedDataset);

        await wizardPage.addAdditionalDataset(RobotChartsDatasets.GeoDatasetTest);

        await wizardPage.datasetSelector.click();

        await wizardPage.datasetSelector.waitForSelectedValue(RobotChartsDatasets.GeoDatasetTest);

        await wizardPage.datasetSelector.clickToSelectDatasetItemWithText(
            RobotChartsDatasets.CsvBasedDataset,
        );

        await wizardPage.datasetSelector.waitForSelectedValue(RobotChartsDatasets.CsvBasedDataset);
    });
});
