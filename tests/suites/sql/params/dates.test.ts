import {Page} from '@playwright/test';

import QLPage from '../../../page-objects/ql/QLPage';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

const sqlScriptWithDateParam = `select {{target_date}}`;

datalensTest.describe('SQL - date parameter setting default value', () => {
    datalensTest(
        'Checking that the date parameter default value sets correctly',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForCHYTDemo);

            await qlPage.setVisualization(WizardVisualizationId.FlatTable);

            await qlPage.setScript(sqlScriptWithDateParam);

            await qlPage.openParamsTab();

            await qlPage.addParam();

            await qlPage.selectParamType('date');

            await qlPage.setParamName('target_date');

            await qlPage.openParamDialog();

            await qlPage.selectDate('05.10.1995');

            await qlPage.applyParamDialog();

            await qlPage.runScript();

            const viewTableTexts = await qlPage.chartkit.getRowsTexts();
            const previewTableTexts = await qlPage.previewTable.getRowsTexts();

            expect(String(viewTableTexts[0][0])).toEqual('05.10.1995');
            expect(String(previewTableTexts[0][0])).toEqual('1995-10-05');
        },
    );
});
