import {Page} from '@playwright/test';

import QLPage from '../../../page-objects/ql/QLPage';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

const sqlScriptWithIntervalParam = `select {{target_date_from}}, {{target_date_to}}`;

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

    datalensTest(
        'Checking that the date-interval parameter default value sets correctly',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForCHYTDemo);

            await qlPage.setVisualization(WizardVisualizationId.FlatTable);

            await qlPage.setScript(sqlScriptWithIntervalParam);

            await qlPage.openParamsTab();

            await qlPage.addParam();

            await qlPage.selectParamType('date-interval');

            await qlPage.setParamName('target_date');

            await qlPage.openParamDialog();

            await qlPage.selectRangeDate(['05.10.1995', '18.02.2018']);

            await qlPage.applyParamDialog();

            await qlPage.runScript();

            const viewTableTexts = await qlPage.chartkit.getRowsTexts();
            const previewTableTexts = await qlPage.previewTable.getRowsTexts();

            expect(String(viewTableTexts[0][0])).toEqual('05.10.1995');
            expect(String(viewTableTexts[0][1])).toEqual('18.02.2018');
            expect(String(previewTableTexts[0][0])).toEqual('1995-10-05');
            expect(String(previewTableTexts[0][1])).toEqual('2018-02-18');
        },
    );
});
