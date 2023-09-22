import {Page} from '@playwright/test';

import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDatasetUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const ROW_TO_DELETE_INDEX = 0;

datalensTest.describe('Datasets - Parameter Deletion', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithAddedParameter, {
            tab: 'parameters',
        });
    });

    datalensTest('Parameter Deletion', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        await waitForCondition(async () => {
            const rowsCount = await datasetPage.datasetTabSection.getRowsCount();

            return rowsCount === 1;
        });

        await datasetPage.datasetTabSection.deleteRow(ROW_TO_DELETE_INDEX);

        await waitForCondition(async () => {
            const rowsCount = await datasetPage.datasetTabSection.getRowsCount();

            return rowsCount === 0;
        }).catch(() => {
            throw new Error('The string with the parameter was not deleted');
        });
    });
});
