import {expect} from '@playwright/test';
import {DialogFieldSubTotalsQa, WizardVisualizationId} from '../../../../src/shared';
import {ChartSettingsItems} from '../../../page-objects/wizard/ChartSettings';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard pagination in the pivot table', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'Sales');
    });

    datalensTest('Pagination should work for new pivot tables', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.PivotTableColumns,
            'Region',
        );

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Sub-Category');

        await wizardPage.chartSettings.open();

        await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Pagination, 'on');

        await wizardPage.chartSettings.setLimit(10);

        const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

        await wizardPage.chartSettings.apply();

        await apiRunPromise;

        const paginator = wizardPage.page.locator('.chartkit-table-paginator');

        await expect(paginator).toBeVisible();

        const rows = await wizardPage.chartkit.getTableRowsCount();

        expect(rows).toEqual(10);

        await wizardPage.chartkit.navigateToNextTablePage(1);

        await waitForCondition(async () => {
            const rowsPage2 = await wizardPage.chartkit.getTableRowsCount();

            return rowsPage2 === 7;
        }).catch(() => {
            throw new Error('Pagination did not redraw the table');
        });
    });

    datalensTest(
        'If only totals are drawn on the last page, then there should be only 1 line',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'Region',
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Category');

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Pagination, 'on');

            await wizardPage.chartSettings.setLimit(3);

            await wizardPage.chartSettings.apply();

            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.PivotTableColumns,
                'Region',
            );

            await wizardPage.visualizationItemDialog.toggleSwitch(
                slct(DialogFieldSubTotalsQa.SubTotalsSwitch),
            );

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await wizardPage.chartkit.waitForPaginationExist();

            await wizardPage.chartkit.navigateToNextTablePage(1);

            const rows = wizardPage.chartkit.getTableLocator().locator('tbody tr');
            await expect(rows).toHaveCount(1);
        },
    );

    datalensTest('When enabling fallback, pagination should be disabled', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.PivotTableColumns,
            'Region',
        );

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Sub-Category');

        await wizardPage.chartSettings.open();

        await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Pagination, 'on');

        await wizardPage.chartSettings.setLimit(3);

        const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

        await wizardPage.chartSettings.apply();

        await apiRunPromise;

        const paginator = wizardPage.page.locator('.chartkit-table-paginator');

        await expect(paginator).toBeVisible();

        const rows = await wizardPage.chartkit.getTableRowsCount();

        expect(rows).toEqual(3);

        await wizardPage.chartSettings.open();

        await wizardPage.chartSettings.toggleSettingItem(
            ChartSettingsItems.PivotTableFallback,
            'on',
        );

        const apiRunPromiseWithFallback = wizardPage.waitForSuccessfulResponse('/api/run');

        await wizardPage.chartSettings.apply();

        await apiRunPromiseWithFallback;

        const paginatorWithFallback = wizardPage.page.locator('.chartkit-table-paginator');

        await expect(paginatorWithFallback).not.toBeVisible();

        const rowsWithFallback = await wizardPage.chartkit.getTableRowsCount();

        expect(rowsWithFallback).toEqual(17);
    });
});
