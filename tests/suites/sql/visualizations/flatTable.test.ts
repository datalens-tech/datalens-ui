import {Page} from '@playwright/test';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {DialogFieldMainSectionQa} from '../../../../src/shared/constants';

import {CommonUrls} from '../../../page-objects/constants/common-urls';
import QLPage from '../../../page-objects/ql/QLPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const sqlScriptWithArray = `select [1,2,3,4,5]`;

const sqlScript3Columns = `select 1, 2, 3`;
const sqlScript4Columns = `select 1, 'x', 2, 3`;

const sqlScriptForFormatting = `select 1337 as "test_column"`;

datalensTest.describe('SQL - check visualizations - table', () => {
    datalensTest(
        'Checking that the array in the table is formatted correctly',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForCHYTDemo);

            await qlPage.setVisualization(WizardVisualizationId.FlatTable);

            await qlPage.setScript(sqlScriptWithArray);

            const successfulResponsePromise = qlPage.waitForSuccessfulResponse(CommonUrls.ApiRun);

            await qlPage.runScript();

            await successfulResponsePromise;

            await qlPage.chartkit.waitUntilLoaderExists();
            await qlPage.waitForSomeSuccessfulRender();

            await waitForCondition(async () => {
                const viewTableTexts = await qlPage.chartkit.getRowsTexts();
                const previewTableTexts = await qlPage.previewTable.getRowsTexts();

                return (
                    viewTableTexts[0][0] === '[1,2,3,4,5]' &&
                    previewTableTexts[0][0] === '[1,2,3,4,5]'
                );
            });
        },
    );

    datalensTest(
        'We check that when adding columns to SELECT, the column names are not lost',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForCHYTDemo);

            await qlPage.setVisualization(WizardVisualizationId.FlatTable);

            await qlPage.setScript(sqlScript3Columns);

            const successfulResponsePromise = qlPage.waitForSuccessfulResponse(CommonUrls.ApiRun);

            await qlPage.runScript();

            await successfulResponsePromise;

            await qlPage.waitForSomeSuccessfulRender();

            const viewTableTexts = await qlPage.chartkit.getHeadRowsTexts();
            const previewTableTexts = await qlPage.previewTable.getHeadRowsTexts();

            expect(String(viewTableTexts[0])).toEqual('1,2,3');
            expect(String(previewTableTexts[0])).toEqual('1,2,3');

            await qlPage.clearScript();

            await qlPage.setScript(sqlScript4Columns);

            const successfulResponsePromise2 = qlPage.waitForSuccessfulResponse(CommonUrls.ApiRun);

            await qlPage.runScript();

            await successfulResponsePromise2;

            const viewTableTexts2 = await qlPage.chartkit.getHeadRowsTexts();
            const previewTableTexts2 = await qlPage.previewTable.getHeadRowsTexts();

            expect(String(viewTableTexts2[0])).toEqual('1,2,3');
            expect(String(previewTableTexts2[0])).toEqual(`1,'x',2,3`);
        },
    );

    datalensTest(
        'Checking that the formatting settings are working',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForPostgresDemo);

            await qlPage.setVisualization(WizardVisualizationId.FlatTable);

            await qlPage.setScript(sqlScriptForFormatting);

            const successfulResponsePromise = qlPage.waitForSuccessfulResponse(CommonUrls.ApiRun);

            await qlPage.runScript();

            await successfulResponsePromise;

            await qlPage.waitForSomeSuccessfulRender();

            const viewTableTexts = await qlPage.chartkit.getRowsTexts();
            const previewTableTexts = await qlPage.previewTable.getRowsTexts();

            expect(String(viewTableTexts[0])).toEqual('1 337');
            expect(String(previewTableTexts[0])).toEqual('1337');

            await qlPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                'test_column',
            );
            await qlPage.visualizationItemDialog.changeInputValue(
                DialogFieldMainSectionQa.PrefixInput,
                '#',
            );

            const successfulResponsePromise2 = qlPage.waitForSuccessfulResponse(CommonUrls.ApiRun);

            await qlPage.visualizationItemDialog.clickOnApplyButton();

            await successfulResponsePromise2;

            const viewTableTextsAfterFormatting = await qlPage.chartkit.getRowsTexts();
            const previewTableTextsAfterFormatting = await qlPage.previewTable.getRowsTexts();

            expect(String(viewTableTextsAfterFormatting[0])).toEqual('#1 337');
            expect(String(previewTableTextsAfterFormatting[0])).toEqual('1337');
        },
    );
});
