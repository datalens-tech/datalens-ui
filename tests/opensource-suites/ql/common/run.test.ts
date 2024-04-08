import {expect} from '@playwright/test';

import QLPage from '../../../page-objects/ql/QLPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('QL', () => {
    datalensTest(
        'First and next click on Run button should trigger only one api/run request',
        async ({page, config}) => {
            await openTestPage(page, config.ql.urls.NewQLChartWithConnection);
            const qlPage = new QLPage({page});
            await qlPage.setScript(`select 1`);

            let numberOfRequests = 0;
            await page.on('request', (request) => {
                if (request.url().includes('api/run')) {
                    numberOfRequests += 1;
                }
            });

            // Check first run
            await qlPage.runScript();
            await qlPage.chartkit.waitUntilLoaderExists();
            expect(numberOfRequests).toEqual(1);

            // Check second and other runs
            numberOfRequests = 0;
            await qlPage.runScript();
            await qlPage.chartkit.waitUntilLoaderExists();
            expect(numberOfRequests).toEqual(1);
        },
    );
});
