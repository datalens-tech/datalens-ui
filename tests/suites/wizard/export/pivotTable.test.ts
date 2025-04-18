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
            '"Central";"28.12.2017";1008,5;260,60000348091125;-10\n' +
            '"East";"28.12.2017";1008,5;134,5999994277954;55\n' +
            '"South";"28.12.2017";1008,5;64,80000305175781;-13\n' +
            '"West";"28.12.2017";1008,5;1197,5999972820282;212';

        await expect(content).toEqual(expected);
    });
});
