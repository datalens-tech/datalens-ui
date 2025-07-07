import {Page} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsPreviewUrls, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ChartPage} from '../../../page-objects/ChartPage';
import ChartKit from '../../../page-objects/wizard/ChartKit';

async function checkCsvExport(page: Page, chartkit: ChartKit) {
    const exportPromise = page.waitForRequest('/api/export');

    // open the csv download modal
    await chartkit.openCsvExportDialog();

    // check that the value separator selector has been rendered
    let select = await page.$(`${slct(ChartkitMenuDialogsQA.chartMenuExportCsvSelectDelimiter)}`);
    let selectText = (await select?.innerText()) || '';
    let selectTextLength = selectText.length;
    // has some text
    expect(selectTextLength).toBeGreaterThan(0);

    // check that the separator selector of the fractional part has been rendered
    select = await page.$(`${slct(ChartkitMenuDialogsQA.chartMenuExportCsvSelectFloat)}`);
    selectText = (await select?.innerText()) || '';
    selectTextLength = selectText.length;
    // has some text
    expect(selectTextLength).toBeGreaterThan(0);

    // check that the encoding selector has been rendered
    select = await page.$(`${slct(ChartkitMenuDialogsQA.chartMenuExportCsvSelectCharset)}`);
    selectText = (await select?.innerText()) || '';
    selectTextLength = selectText.length;
    // has some text
    expect(selectTextLength).toBeGreaterThan(0);

    // click on the Download button
    await page.click(slct(ChartkitMenuDialogsQA.chartMenuExportModalApplyBtn));

    // waiting for a download request
    await exportPromise;
}

datalensTest.describe('Chart export', () => {
    datalensTest.describe(
        'Clicking on the Export menu opens the modal, the Download request goes away',
        () => {
            datalensTest('wizard page', async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(page, RobotChartsWizardUrls.WizardWithComments);
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await checkCsvExport(page, wizardPage.chartkit);
            });
            datalensTest('preview page', async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(page, RobotChartsPreviewUrls.PreviewChartWithDate);

                await checkCsvExport(page, chartPage.chartkit);
            });
        },
    );
});
