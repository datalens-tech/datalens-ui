import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {ColorValue} from '../../../../page-objects/wizard/ColorDialog';
import {DOMNamedAttributes} from '../../../../page-objects/wizard/ChartKit';
import {
    LINE_WIDTH_DEFAULT_VALUE,
    LINE_WIDTH_MAX_VALUE,
    LINE_WIDTH_MIN_VALUE,
    LINE_WIDTH_VALUE_STEP,
} from '../../../../../src/ui/units/wizard/constants/shapes';

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

        datalensTest('User can change line width', async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            const defaultLineWidth = LINE_WIDTH_DEFAULT_VALUE.toString();
            const newLineWidth = '5';

            let lineWidths = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeWidth,
            );

            expect(lineWidths.length).toEqual(1);
            expect(lineWidths[0]).toEqual(defaultLineWidth);

            await wizardPage.shapeDialog.open();

            await wizardPage.shapeDialog.changeLineWidth(newLineWidth);

            await wizardPage.shapeDialog.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            lineWidths = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeWidth,
            );

            expect(lineWidths.length).toEqual(1);
            expect(lineWidths[0]).toEqual(String(newLineWidth));
        });

        datalensTest('User can only select line widths 1–12', async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.shapeDialog.open();
            await wizardPage.shapeDialog.clickLineWidthSelectControl();

            const optionElements = await wizardPage.shapeDialog.getLineWidthSelectOptions();

            expect(await optionElements.count()).toEqual(LINE_WIDTH_MAX_VALUE);

            for (
                let i = LINE_WIDTH_MIN_VALUE;
                i <= LINE_WIDTH_MAX_VALUE;
                i += LINE_WIDTH_VALUE_STEP
            ) {
                const optionElement = optionElements.nth(i - 1);
                const optionValue = i.toString();

                await expect(optionElement.locator(`[data-qa="${optionValue}"]`)).toBeVisible();
            }
        });
    });
});
