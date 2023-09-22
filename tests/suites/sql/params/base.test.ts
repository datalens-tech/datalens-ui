import {Page} from '@playwright/test';

import QLPage from '../../../page-objects/ql/QLPage';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('SQL - checking the basic operation of parameters', () => {
    datalensTest(
        'We check that the string parameter is correctly substituted (by default)',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.QLChartWithStringParameter);

            await qlPage.waitForSomeSuccessfulRender();

            const viewTableTexts = await qlPage.chartkit.getRowsTexts();
            const previewTableTexts = await qlPage.previewTable.getRowsTexts();

            expect(String(viewTableTexts[0][0])).toEqual('1970');
            expect(String(viewTableTexts[0][1])).toEqual('71,23');
            expect(String(previewTableTexts[0][0])).toEqual('1970');
            expect(String(previewTableTexts[0][1])).toEqual('71.23');
        },
    );

    datalensTest(
        'We check that the string parameter is correctly substituted (from the URL)',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.QLChartWithStringParameterSet);

            await qlPage.waitForSomeSuccessfulRender();

            const viewTableTexts = await qlPage.chartkit.getRowsTexts();
            const previewTableTexts = await qlPage.previewTable.getRowsTexts();

            expect(String(viewTableTexts[0][0])).toEqual('2000');
            expect(String(viewTableTexts[0][1])).toEqual('66,75');
            expect(String(previewTableTexts[0][0])).toEqual('2000');
            expect(String(previewTableTexts[0][1])).toEqual('66.75');
        },
    );
});
