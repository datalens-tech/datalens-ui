import {Page} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Chart export', () => {
    datalensTest(
        'Clicking on the Export menu opens the modal, the Download request goes away',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithComments);
            await wizardPage.waitForSuccessfulResponse('/api/run');

            const exportPromise = page.waitForRequest('/api/export');

            // open the csv download modal
            await wizardPage.chartkit.openCsvExportDialog();

            // check that the value separator selector has been rendered
            let select = await page.$(
                `${slct(ChartkitMenuDialogsQA.chartMenuExportCsvSelectDelimiter)}`,
            );
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
        },
    );
});
