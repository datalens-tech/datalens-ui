import {Page, expect} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const SELECTORS = {
    COLUMN_SELECTOR_TEXT: '.chartkit-table__content_text',
    COLUMN_CAPTURE_DESCRIPTION:
        '.data-table__table-wrapper_sticky th.chartkit-table__cell_type_text',
};

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

            const columnSelectorText = page.locator(SELECTORS.COLUMN_SELECTOR_TEXT).first();

            // Check the default state of the first cell of the table
            await expect(columnSelectorText.getByText(VALUES.DEFAULT_CELL_VALUE)).toBeVisible();

            // Click on the column header to sort DESC
            await page.click(SELECTORS.COLUMN_CAPTURE_DESCRIPTION);

            // Data in the table has been redrawn
            await expect(columnSelectorText.getByText(VALUES.CELL_SORTED_FIRST)).toBeVisible();

            // Click on the column header to sort ASC
            await page.click(SELECTORS.COLUMN_CAPTURE_DESCRIPTION);

            // Data in the table has been redrawn
            await expect(columnSelectorText.getByText(VALUES.CELL_SORTED_SECOND)).toBeVisible();

            // Click on the column header to reset the sorting
            await page.click(SELECTORS.COLUMN_CAPTURE_DESCRIPTION);

            // Data in the table has been redrawn
            await expect(columnSelectorText.getByText(VALUES.DEFAULT_CELL_VALUE)).toBeVisible();
        },
    );
});
