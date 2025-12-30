import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {ColorValue} from '../../../../page-objects/wizard/ColorDialog';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Line chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            await wizardPage.setVisualization([WizardVisualizationId.Line]);
        });

        datalensTest(
            'Multiple fields on the Y axis with shapes, colors are assigned correctly @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

                await wizardPage.createNewFieldWithFormula(
                    'orderMonth',
                    `datetrunc([Order_date], 'month')`,
                );
                await wizardPage.createNewFieldWithFormula('orderYear', `year([Order_date])`);
                await wizardPage.createNewFieldWithFormula('orderCount', `countd([order_id])`);
                await wizardPage.createNewFieldWithFormula('salesSum', `sum([Sales])`);

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'orderMonth',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'salesSum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'orderCount',
                );

                await wizardPage.sectionVisualization.removeFieldByClick(
                    PlaceholderName.Shapes,
                    'Measure Names',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Shapes,
                    'orderYear',
                );

                await wizardPage.colorDialog.open();

                const fieldValues = await wizardPage.colorDialog.getFieldValues();

                expect(fieldValues.length).toBe(2);

                await wizardPage.colorDialog.selectColor(ColorValue.DEFAULT_20_DarkOrange);

                await wizardPage.colorDialog.selectFieldValue(fieldValues[1]);
                await wizardPage.colorDialog.selectColor(ColorValue.DEFAULT_20_LightGreen);

                await wizardPage.colorDialog.apply();

                await expect(chart).toBeVisible();
                await expect(chartContainer).toHaveScreenshot();
            },
        );
    });
});
