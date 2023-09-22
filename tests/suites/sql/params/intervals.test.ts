import {Page} from '@playwright/test';

import QLPage from '../../../page-objects/ql/QLPage';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('SQL - interval parameter recognition check with operation', () => {
    datalensTest(
        'Checking that the parameter with the interval and operation was correctly recognized',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.QLChartWithIntervalParameter);

            await qlPage.chartkit.waitUntilLoaderExists();
            await qlPage.waitForSomeSuccessfulRender();

            const viewTableTexts = await qlPage.chartkit.getRowsTexts();
            const previewTableTexts = await qlPage.previewTable.getRowsTexts();

            expect(String(viewTableTexts[0][0])).toEqual('18.04.2023');
            expect(String(viewTableTexts[0][1])).toEqual('21.04.2023');
            expect(String(previewTableTexts[0][0])).toEqual('2023-04-18');
            expect(String(previewTableTexts[0][1])).toEqual('2023-04-21');
        },
    );
});
