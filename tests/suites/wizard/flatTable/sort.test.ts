import {Page, expect} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const VALUES = {
    DEFAULT_CELL_VALUE: 'Consumer OFF-PA-10000174 DP-13000',
    CELL_SORTED_FIRST: 'Home Office TEC-PH-10004977 ME-17320',
    CELL_SORTED_SECOND: 'Consumer FUR-BO-10000330 AG-10900',
};

datalensTest.describe('Wizard :: Flat table :: Sorting', () => {
    datalensTest(
        'Sorting is enabled by clicking on the column header of the table, the data is redrawn',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardFlatTable);
            await wizardPage.chartkit.waitForPaginationExist();

            const table = wizardPage.chartkit.getTableLocator();
            const firstColumnCell = table.locator('tbody td:nth-child(2)').first();
            const columnHeaderText = 'Unique Segment Field';
            const columnHeader = table
                .locator('thead')
                .first()
                .locator('th', {has: page.getByText(columnHeaderText)});

            // Check the default state of the first cell of the table
            await expect(firstColumnCell.getByText(VALUES.DEFAULT_CELL_VALUE)).toBeVisible();

            // Click on the column header to sort DESC
            await columnHeader.click();

            // Data in the table has been redrawn
            await expect(firstColumnCell.getByText(VALUES.CELL_SORTED_FIRST)).toBeVisible();

            // Click on the column header to sort ASC
            await columnHeader.click();

            // Data in the table has been redrawn
            await expect(firstColumnCell.getByText(VALUES.CELL_SORTED_SECOND)).toBeVisible();

            // Click on the column header to reset the sorting
            await columnHeader.click();

            // Data in the table has been redrawn
            await expect(firstColumnCell.getByText(VALUES.DEFAULT_CELL_VALUE)).toBeVisible();
        },
    );
});
