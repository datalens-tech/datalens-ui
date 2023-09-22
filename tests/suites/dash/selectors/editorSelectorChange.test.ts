import {Page} from '@playwright/test';
import {ControlQA} from '../../../../src/shared/constants';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {clickSelectOption, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const SELECTORS = {
    TABLE_CELL: 'chartkit-table__content_value',
    CONTROL_INPUT: 'yc-text-input__control',
};

const PARAMS = {
    SELECT_VALUE_1: 'TempValue',
};

datalensTest.describe('Dashboards are an Editorial selector', () => {
    datalensTest(
        'In the chart, a change in the selector parameters is applied',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithEditorSelectorAndChart);

            // checking that input and select labels exist
            await dashboardPage.waitForSelector(slct(ControlQA.controlSelect));
            await dashboardPage.waitForSelector(slct(ControlQA.controlInput));

            // Initialize subscription to requests during default timeout
            const promise = dashboardPage.waitForResponses('/api/run');

            // changing the value in the external selector
            await clickSelectOption(page, ControlQA.controlSelect, PARAMS.SELECT_VALUE_1);

            // Getting an array of requests /api/run
            const responses = await promise;

            // Check that it took exactly two requests /api/run
            expect(responses).toHaveLength(2);

            // check that after changing the value of the external selector, the value in the control of the table has changed
            const inputText = await page.locator(`.${SELECTORS.CONTROL_INPUT}`).inputValue();
            expect(inputText).toEqual(PARAMS.SELECT_VALUE_1);

            // check that after changing the value of the external selector, the value in the table cell has changed
            const cell = await page.$(`.${SELECTORS.TABLE_CELL}`);
            const tableCellText = await cell?.innerText();
            expect(tableCellText).toEqual(PARAMS.SELECT_VALUE_1);
        },
    );
});
