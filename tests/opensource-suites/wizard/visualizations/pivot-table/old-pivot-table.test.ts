import {expect} from '@playwright/test';

import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {ChartSettingsItems} from '../../../../page-objects/wizard/ChartSettings';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(
                ChartSettingsItems.PivotTableFallback,
                'on',
            );
            await wizardPage.chartSettings.apply();
        });

        datalensTest('Table with Rows only @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'ship_mode',
            );

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
