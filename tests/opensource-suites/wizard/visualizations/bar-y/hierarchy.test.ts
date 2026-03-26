import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Bar-y chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            const newHierarchyField = 'hierarchy';
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.setName(newHierarchyField);
            await wizardPage.hierarchyEditor.selectFields(['country', 'region']);
            await wizardPage.hierarchyEditor.clickSave();

            await wizardPage.setVisualization(WizardVisualizationId.Bar);
        });

        datalensTest(
            'Go to the next level when clicking on a chart with a hierarchy',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const chartPreview = page.locator(slct(WizardPageQa.SectionPreview));

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'hierarchy',
                );
                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'sales');

                const breadcrumbItems = chartPreview.locator(slct(ChartKitQa.DrillBreadcrumbsItem));
                await expect(breadcrumbItems).toHaveText(['country'], {
                    useInnerText: true,
                });

                const bar = chartPreview.locator('.gcharts-bar-y').first();
                await expect(bar).toBeVisible();
                await bar.click({force: true});

                await expect(breadcrumbItems).toHaveText(['country: United States', 'region'], {
                    useInnerText: true,
                });
            },
        );
    });
});
