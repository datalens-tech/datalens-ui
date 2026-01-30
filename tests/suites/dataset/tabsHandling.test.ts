import {Page} from '@playwright/test';

import {DATASET_TAB} from '../../../src/shared/constants/qa/datasets';

import {openTestPage} from '../../utils';
import {RobotChartsDatasetUrls} from '../../utils/constants';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import DatasetPage from '../../page-objects/dataset/DatasetPage';

datalensTest.describe('Datasets - Handling tabs', () => {
    datalensTest(
        'Should open sources tab in case of creating a new dataset',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDatasetUrls.NewDataset);
            const datasetPage = new DatasetPage({page});
            const tab = await datasetPage.getCurrentTabName();
            expect(tab).toBe(DATASET_TAB.SOURCES);
        },
    );
    datalensTest(
        'Should open dataset tab in case of opening an existing dataset',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters);
            const datasetPage = new DatasetPage({page});
            const tab = await datasetPage.getCurrentTabName();
            expect(tab).toBe(DATASET_TAB.DATASET);
        },
    );
    datalensTest('Should open sources tab via query param', async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters, {
            tab: DATASET_TAB.SOURCES,
        });
        const datasetPage = new DatasetPage({page});
        const tab = await datasetPage.getCurrentTabName();
        expect(tab).toBe(DATASET_TAB.SOURCES);
    });
    datalensTest('Should open dataset tab via query param', async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters, {
            tab: DATASET_TAB.DATASET,
        });
        const datasetPage = new DatasetPage({page});
        const tab = await datasetPage.getCurrentTabName();
        expect(tab).toBe(DATASET_TAB.DATASET);
    });
    datalensTest('Should open filters tab via query param', async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters, {
            tab: DATASET_TAB.FILTERS,
        });
        const datasetPage = new DatasetPage({page});
        const tab = await datasetPage.getCurrentTabName();
        expect(tab).toBe(DATASET_TAB.FILTERS);
    });
    datalensTest('Should open parameters tab via query param', async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters, {
            tab: DATASET_TAB.PARAMETERS,
        });
        const datasetPage = new DatasetPage({page});
        const tab = await datasetPage.getCurrentTabName();
        expect(tab).toBe(DATASET_TAB.PARAMETERS);
    });
    datalensTest(
        'Should open sources tab in case of opening an existing dataset and using incorrect query param',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDatasetUrls.NewDataset, {
                tab: 'non-existing-tab',
            });
            const datasetPage = new DatasetPage({page});
            const tab = await datasetPage.getCurrentTabName();
            expect(tab).toBe(DATASET_TAB.SOURCES);
        },
    );
    datalensTest(
        'Should open dataset tab in case of opening an existing dataset and using incorrect query param',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters, {
                tab: 'non-existing-tab',
            });
            const datasetPage = new DatasetPage({page});
            const tab = await datasetPage.getCurrentTabName();
            expect(tab).toBe(DATASET_TAB.DATASET);
        },
    );
});
