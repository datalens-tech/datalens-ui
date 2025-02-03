import {expect, Page} from '@playwright/test';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {ChartkitMenuDialogsQA, Operations} from '../../../../src/shared';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - export. Summary table', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});
        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);
        await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'DATE');
        await wizardPage.filterEditor.selectFilterOperation(Operations.EQ);
        await wizardPage.filterEditor.selectDate('28.12.2017');
        await wizardPage.filterEditor.apply();

        await wizardPage.createNewFieldWithFormula('Field', '[Year]/2');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Region'); // string
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'DATE'); // date
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Field'); // float

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'Sales');
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'Profit');

        await wizardPage.chartkit.waitUntilLoaderExists();

        await wizardPage.page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    });

    datalensTest('CSV', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const content = await wizardPage.chartkit.exportCsv({
            fractionDelimiter: ChartkitMenuDialogsQA.chartMenuExportCsvDecimalDelimiterComma,
        });

        const expected =
            '"Region";"DATE";"Field";"Sales";"Profit"\n' +
            'Central;28.12.2017;1008,5;209,3000030517578;56\n' +
            'East;28.12.2017;1008,5;466,8000068664551;33\n' +
            'West;28.12.2017;1008,5;37,60000038146973;9';

        await expect(content).toEqual(expected);
    });
});
