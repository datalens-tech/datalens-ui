import {expect, Page} from '@playwright/test';

import DatasetPage from '../../page-objects/dataset/DatasetPage';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../utils';
import {RobotChartsDatasetUrls} from '../../utils/constants';
import {CreateEntityButton, DATASET_TAB, DlNavigationQA} from '../../../src/shared';

datalensTest.describe('Datasets - transition to new page from exist dataset', () => {
    datalensTest('New page must open correctly', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({
            page,
        });
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters);
        await datasetPage.waitForSuccessfulResponse('/getSources');

        const datasetsLink = page.locator(
            `${slct(DlNavigationQA.AsideMenuItem)}[href="/datasets"]`,
        );

        await datasetsLink.click();
        const createEntityButton = page.locator(slct(CreateEntityButton.Button));
        await createEntityButton.click();

        await expect(page).toHaveURL(RobotChartsDatasetUrls.NewDataset);
        const tabName = await datasetPage.getCurrentTabName();
        expect(tabName).toBe(DATASET_TAB.SOURCES);
    });
});
