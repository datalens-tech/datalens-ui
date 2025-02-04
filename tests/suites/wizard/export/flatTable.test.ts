import {expect, Page} from '@playwright/test';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {openTestPage, slct} from '../../../utils';
import {readDownload} from '../../../utils/playwright/utils';
import {Operations} from '../../../../src/shared';

datalensTest.describe('Wizard - export. Table', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Region',
        );
        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'DATE',
        );
        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Sales',
        );

        const apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'DATE');
        await wizardPage.filterEditor.selectFilterOperation(Operations.EQ);
        await wizardPage.filterEditor.selectDate('28.12.2017');
        await wizardPage.filterEditor.apply();
        await (await apiRunRequest).response();

        await wizardPage.page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    });

    datalensTest('CSV comma decimal separator', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const downloadPromise = wizardPage.page.waitForEvent('download');

        await wizardPage.chartkit.openCsvExportDialog();

        await wizardPage.page.click(slct(ChartkitMenuDialogsQA.chartMenuExportCsvSelectFloat));
        await wizardPage.page.click(
            slct(ChartkitMenuDialogsQA.chartMenuExportCsvDecimalDelimiterComma),
        );

        await wizardPage.page.click(slct(ChartkitMenuDialogsQA.chartMenuExportModalApplyBtn));

        const download = await downloadPromise;
        const content = await readDownload(download);

        const expected =
            '"Region";"DATE";"Sales"\n' +
            'Central;28.12.2017;260,60000348091125\n' +
            'East;28.12.2017;134,5999994277954\n' +
            'South;28.12.2017;64,80000305175781\n' +
            'West;28.12.2017;1197,5999972820282';

        await expect(content?.toString('utf8')).toEqual(expected);
    });

    datalensTest('CSV space delimiter', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const downloadPromise = wizardPage.page.waitForEvent('download');

        await wizardPage.chartkit.openCsvExportDialog();

        await wizardPage.page.click(slct(ChartkitMenuDialogsQA.chartMenuExportCsvSelectDelimiter));
        await wizardPage.page.click(
            slct(ChartkitMenuDialogsQA.chartMenuExportCsvValueDelimiterSpace),
        );

        await wizardPage.page.click(slct(ChartkitMenuDialogsQA.chartMenuExportModalApplyBtn));

        const download = await downloadPromise;
        const content = await readDownload(download);

        const expected =
            '"Region" "DATE" "Sales"\n' +
            'Central 28.12.2017 260.60000348091125\n' +
            'East 28.12.2017 134.5999994277954\n' +
            'South 28.12.2017 64.80000305175781\n' +
            'West 28.12.2017 1197.5999972820282';

        await expect(content?.toString('utf8')).toEqual(expected);
    });
});
