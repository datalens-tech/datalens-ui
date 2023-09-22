import {Page} from '@playwright/test';

import DatasetPage from '../../page-objects/dataset/DatasetPage';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../utils';
import {RobotChartsDatasetUrls} from '../../utils/constants';

datalensTest.describe('Datasets - checking for a remote connection in the list', () => {
    datalensTest('Checking for a remote connection', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({
            page,
        });
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithDeletedConnection, {
            tab: 'sources',
        });

        await datasetPage.waitForSelector('.select-sources-prototypes__connection-title_deleted');
    });
});
