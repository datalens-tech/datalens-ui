import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {
    mapDatasetToDatasetPath,
    RobotChartsDatasets,
    RobotChartsWizardUrls,
} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {SectionDatasetQA} from '../../../../src/shared';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - actions on datasets', () => {
    datalensTest('Go to dataset', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        const [childPage] = await Promise.all([
            page.waitForEvent('popup'),
            wizardPage.datasetSelector.clickToDatasetAction(
                RobotChartsDatasets.CitiesDataset,
                SectionDatasetQA.GoToDatasetButton,
            ),
        ]);

        const datasetPath = mapDatasetToDatasetPath[RobotChartsDatasets.CitiesDataset];
        const childPageURL = new URL(childPage.url());
        expect(childPageURL.pathname).toEqual(datasetPath);

        await childPage.close();
    });

    datalensTest('Deleting a dataset', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.Empty);

        await wizardPage.addFirstDataset(RobotChartsDatasets.CsvBasedDataset);

        await wizardPage.addAdditionalDataset(RobotChartsDatasets.GeoDatasetTest);

        const deleteConfirmPromise = new Promise<void>((resolve) => {
            page.on('dialog', (dialog) => {
                dialog.accept();
                resolve();
            });
        });

        await wizardPage.datasetSelector.click();

        let datasetsCount = await wizardPage.datasetSelector.getDatasetsCount();

        expect(datasetsCount).toEqual(2);

        await wizardPage.datasetSelector.clickToDatasetAction(
            RobotChartsDatasets.GeoDatasetTest,
            SectionDatasetQA.RemoveDatasetButton,
        );

        await deleteConfirmPromise;

        datasetsCount = await wizardPage.datasetSelector.getDatasetsCount();

        expect(datasetsCount).toEqual(1);
    });
});
