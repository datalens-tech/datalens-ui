import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {SMALL_SCREENSHOT_VIEWPORT_SIZE} from '../constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pie chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.createNewFieldWithFormula('sum', 'sum([Sales])');

            const newHierarchyField = 'hierarchy';
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.setName(newHierarchyField);
            await wizardPage.hierarchyEditor.selectFields(['country', 'region']);
            await wizardPage.hierarchyEditor.clickSave();

            await wizardPage.setVisualization(WizardVisualizationId.PieD3);
        });

        datalensTest(
            'Go to the next level when clicking on a chart with a hierarchy @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = chartContainer.locator('.gcharts-d3');
                const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'hierarchy',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Measures,
                    'sum',
                );

                await expect(previewLoader).not.toBeVisible();
                const box = await chart.boundingBox();
                if (box) {
                    await page.mouse.click(box.x + box.width / 4, box.y + box.height / 2);
                    await expect(previewLoader).not.toBeVisible();
                    await expect(chartContainer).toHaveScreenshot();
                } else {
                    throw Error('chart boundingBox is null');
                }
            },
        );
    });
});
