import {Page, expect} from '@playwright/test';

import {DialogParameterDataTypes} from '../../../page-objects/common/DialogParameter';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {RobotChartsDatasetUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Datasets - Parameter Editing', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithAddedParameter, {
            tab: 'parameters',
        });
    });

    datalensTest('Parameter Editing', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        const ROW_INDEX = 0;

        const NEW_NAME = 'test_parameter_edited';
        const NEW_TYPE = DialogParameterDataTypes.Boolean;
        const NEW_VALUE = 'true';

        await datasetPage.datasetTabSection.editRow(ROW_INDEX);

        await datasetPage.dialogParameter.setName(NEW_NAME);

        await datasetPage.dialogParameter.selectType(NEW_TYPE);

        await datasetPage.dialogParameter.setDefaultValueBoolean(NEW_VALUE);

        await datasetPage.dialogParameter.apply();

        const locator = await datasetPage.datasetTabSection.getRowLocatorByIndex(ROW_INDEX);

        await expect(locator).toContainText(NEW_NAME);
        await expect(locator).toContainText(NEW_VALUE);

        const typeLocator = locator.getByTestId(`${NEW_TYPE}-row-0`);

        await expect(typeLocator).toHaveCount(1);
    });
});
