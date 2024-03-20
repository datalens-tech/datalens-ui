import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    DialogFieldSubTotalsQa,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            // Create measure field
            const measureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([order_id])');

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
        });

        datalensTest('Subtotals for NULL values', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));

            // Setup filters
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'city');
            await wizardPage.filterEditor.selectValues(['Aberdeen', 'Aurora']);
            await wizardPage.filterEditor.apply();

            // Create two nullable fields
            await wizardPage.createNewFieldWithFormula(
                'Nullable1',
                'if ([region] = "West") then null else [region] end',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'Nullable1',
            );

            await wizardPage.createNewFieldWithFormula(
                'Nullable2',
                'if([City] = "Aberdeen") then null else [City] end',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'Nullable2',
            );

            // Add measure field
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            // Turn on subtotals
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Rows, 'Nullable2');
            await wizardPage.page.locator(slct(DialogFieldSubTotalsQa.SubTotalsSwitch)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            // Each parent row must have subRow with totals
            const subtotalsCell = chartContainer.locator('td', {hasText: 'Total'});
            await expect(subtotalsCell).toHaveText(['Total null', 'Total Central']);
        });
    });
});
