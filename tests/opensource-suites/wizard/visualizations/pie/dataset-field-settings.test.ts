import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {getUniqueTimestamp, openTestPage, slct} from '../../../../utils';
import {
    ChartKitQa,
    DatasetActionQA,
    DatasetFieldColorsDialogQa,
    DatasetFieldSettingsDialogQa,
    DatasetFieldsTabQa,
    SelectQa,
    WizardPageQa,
    WizardVisualizationId,
    WorkbookPageQa,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {WorkbooksUrls} from '../../../../constants/constants';
import {DatasetsEntities} from '../../../../constants/test-entities/datasets';
import {Workbook} from '../../../../page-objects/workbook/Workbook';
import {addCustomPalette} from '../../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pie chart', () => {
        datalensTest('Use color palette from dataset @screenshot', async ({page}, testInfo) => {
            const customPaletteName = `${testInfo.title} (${getUniqueTimestamp()})`;
            await addCustomPalette(page, {name: customPaletteName, colors: ['ff0000']});

            await openTestPage(page, `${WorkbooksUrls.E2EWorkbook}/?tab=dataset`);

            // copy dataset - so that changes in it do not affect other tests
            const originalDatasetRow = page.locator(slct(WorkbookPageQa.ListItem), {
                has: page.locator(slct(DatasetsEntities.Basic.id)),
            });
            await originalDatasetRow.locator(slct(WorkbookPageQa.MenuDropDownBtn)).click();
            await page.locator(slct(WorkbookPageQa.MenuItemDuplicate)).click();

            const workbookPO = new Workbook(page);
            const newDatasetName = `${testInfo.title} (${getUniqueTimestamp()})`;
            await workbookPO.dialogCreateEntry.createEntryWithName(newDatasetName);
            await page.locator(slct(WorkbookPageQa.ListItem), {hasText: newDatasetName}).click();

            // add field colors setting
            const fieldName = 'segment';
            const row = page.locator('.dataset-table__row', {
                has: page
                    .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
                    .locator(`[value=${fieldName}]`),
            });
            await row.hover();
            await row.locator(slct(DatasetFieldsTabQa.FieldSettingsColumnIcon)).click();
            const dialog = page.locator(slct(DatasetFieldSettingsDialogQa.Dialog));
            await dialog.locator(slct(DatasetFieldSettingsDialogQa.ColorSettingsButton)).click();
            // select custom palette
            const colorsDialog = page.locator(slct(DatasetFieldColorsDialogQa.Dialog));
            await colorsDialog.locator('.color-palette-select').click();
            await colorsDialog.locator(slct(SelectQa.POPUP)).getByText(customPaletteName).click();
            // set color from palette for field value
            const paletteItem = colorsDialog
                .locator(slct(DatasetFieldColorsDialogQa.PaleteItem))
                .first();
            await paletteItem.click();
            await colorsDialog.locator('button', {hasText: 'Apply'}).click();
            await dialog.locator('button', {hasText: 'Save'}).click();
            await page.locator(slct(DatasetActionQA.CreateButton)).click();

            const newPagePromise = page.context().waitForEvent('page');
            await page.locator('button', {hasText: 'Create chart'}).click();

            // create pie chart
            const newPage = await newPagePromise;
            const wizardPage = new WizardPage({page: newPage});
            await wizardPage.setVisualization(WizardVisualizationId.Pie);

            const chartContainer = wizardPage.page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'region');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toHaveScreenshot();
        });
    });
});
