import {Page, expect} from '@playwright/test';

import {DialogParameterDataTypes} from '../../../page-objects/common/DialogParameter';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDatasetUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const FIRST_ROW_INDEX = 0;

datalensTest.describe('Datasets - Adding a new parameter', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters, {tab: 'parameters'});
    });

    datalensTest('Adding a parameter to a dataset', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        const PARAMETER_NAME = 'PARAMETER_TEST_NAME';
        const PARAMETER_TYPE = DialogParameterDataTypes.Boolean;
        const PARAMETER_VALUE = 'false';

        await datasetPage.datasetTabSection.clickAddButton();

        await datasetPage.dialogParameter.setName(PARAMETER_NAME);

        await datasetPage.dialogParameter.selectType(PARAMETER_TYPE);

        await datasetPage.dialogParameter.setDefaultValueBoolean(PARAMETER_VALUE);

        await datasetPage.dialogParameter.apply();

        await waitForCondition(async () => {
            const rowsCount = await datasetPage.datasetTabSection.getRowsCount();

            return rowsCount === 1;
        });

        const row = await datasetPage.datasetTabSection.getRowLocatorByIndex(FIRST_ROW_INDEX);

        await expect(row).toContainText(PARAMETER_NAME);
        await expect(row).toContainText(PARAMETER_VALUE);

        const typeLocator = row.getByTestId(`${PARAMETER_TYPE}-row-0`);

        await expect(typeLocator).toHaveCount(1);
    });
});
