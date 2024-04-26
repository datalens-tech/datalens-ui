import {Page} from '@playwright/test';

import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDatasetUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Datasets - Parameter duplication', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithAddedParameter, {
            tab: 'parameters',
        });
    });

    datalensTest('Duplicate parameter', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        const INITIAL_ROW_INDEX = 0;
        const DUPLICATE_ROW_INDEX = 1;

        await waitForCondition(async () => {
            const rowsCount = await datasetPage.datasetTabSection.getRowsCount();

            return rowsCount === 1;
        });

        await datasetPage.datasetTabSection.duplicateRow(INITIAL_ROW_INDEX);

        const initialRow =
            await datasetPage.datasetTabSection.getRowLocatorByIndex(INITIAL_ROW_INDEX);
        const parameterValues = await initialRow.innerText();

        const [initialName, initialType, initialValue] = parameterValues.split('\n');

        const expectedDuplicateName = `${initialName} (1)`;

        const duplicatedRow =
            await datasetPage.datasetTabSection.getRowLocatorByIndex(DUPLICATE_ROW_INDEX);

        const duplicateParameterValues = await duplicatedRow.innerText();

        const [duplicateName, duplicateType, duplicateValue] = duplicateParameterValues.split('\n');

        expect(duplicateName).toEqual(expectedDuplicateName);
        expect(duplicateType).toEqual(initialType);
        expect(duplicateValue).toEqual(initialValue);
    });
});
