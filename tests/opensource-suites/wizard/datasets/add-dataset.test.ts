import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {SectionDatasetQA} from '../../../../src/shared';
import {selectEntryFromNavigationMenu} from '../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Datasets', () => {
        datalensTest('Add dataset', async ({page, config}) => {
            const datasetName = config.datasets.entities.Basic.name;
            await openTestPage(page, config.wizard.urls.NewWizardChart);

            const datasetContainer = page.locator(slct(SectionDatasetQA.DatasetContainer));
            const emptyMessage = datasetContainer.locator(
                slct(SectionDatasetQA.DatasetEmptyMessage),
            );
            const datasetSelect = datasetContainer.locator(slct(SectionDatasetQA.DatasetSelect));
            const datasetFields = datasetContainer.locator(slct(SectionDatasetQA.DatasetFields));

            await expect(emptyMessage).toBeVisible();
            await expect(datasetSelect).toBeVisible();

            await datasetSelect.click();

            await selectEntryFromNavigationMenu(page, datasetName);

            await expect(emptyMessage).not.toBeVisible();
            await expect(datasetFields).toBeVisible();
        });
    });
});
