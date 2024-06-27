import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {SectionDatasetQA} from '../../../../src/shared';
import {selectEntryFromNavigationMenu} from '../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Datasets', () => {
        datalensTest('Replace dataset', async ({page, config}) => {
            const prevDatasetName = config.datasets.entities.Basic.name;
            const nextDatasetName = config.datasets.entities.Orders.name;

            await openTestPage(page, config.wizard.urls.NewWizardChart);

            const datasetContainer = page.locator(slct(SectionDatasetQA.DatasetContainer));
            const datasetSelect = datasetContainer.locator(slct(SectionDatasetQA.DatasetSelect));
            const datasetFields = datasetContainer.locator(slct(SectionDatasetQA.ItemTitle));

            await datasetSelect.click();
            await selectEntryFromNavigationMenu(page, prevDatasetName);
            await expect(datasetFields.first()).toBeVisible();
            // get first dataset fields
            const prevDatasetFields = await datasetFields.allTextContents();

            // replace dataset for next one
            const datasetSelectMore = datasetContainer.locator(
                slct(SectionDatasetQA.DatasetSelectMore),
            );
            await datasetSelect.hover();
            await datasetSelectMore.click();
            const replaceDatasetButton = page.locator(slct(SectionDatasetQA.ReplaceDatasetButton));
            await expect(replaceDatasetButton).toBeVisible();
            await replaceDatasetButton.click();

            await selectEntryFromNavigationMenu(page, nextDatasetName);
            await expect(datasetFields.first()).toBeVisible();

            // check that the dataset fields have changed
            const nextDatasetFields = await datasetFields.allTextContents();
            expect(prevDatasetFields).not.toEqual(nextDatasetFields);
        });
    });
});
