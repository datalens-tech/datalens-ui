import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ControlQA} from '../../../../src/shared';

const expectedValues = [
    '01.08.2022 14:11:11 - 09.08.2022 15:22:23',
    '03.09.2022 13:22:11 - 08.09.2022 11:11:11',
];

datalensTest.describe('Dashboards - Selectors by date/time', () => {
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });

    datalensTest('Date/time selectors should display the time', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.controlActions.addDateRangeSelector({
                    title: 'test-control-1',
                    fieldName: 'test-control-field-1',
                    range: expectedValues[0].split(' - '),
                });

                await dashboardPage.controlActions.addDateRangeSelector({
                    title: 'test-control',
                    fieldName: 'test-control-field',
                    range: expectedValues[1].split(' - '),
                });
            },
        });

        await dashboardPage.waitForSelector(
            `${slct(ControlQA.chartkitControl)} input[value='${expectedValues[0]}']`,
        );
        await dashboardPage.waitForSelector(
            `${slct(ControlQA.chartkitControl)} input[value='${expectedValues[1]}']`,
        );
    });
});
