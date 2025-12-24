import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {
    DatasetFieldColorsDialogQa,
    DatasetFieldSettingsDialogQa,
    DatasetFieldsTabQa,
} from '../../../../src/shared';

datalensTest.describe('Dataset', () => {
    datalensTest.describe('Field settings', () => {
        datalensTest('Assign the same color to several fields in a row', async ({page, config}) => {
            await openTestPage(page, `/datasets${config.datasets.entities.Basic.url}`);

            const fieldName = 'region';
            const row = page.locator('.dataset-table__row', {
                has: page
                    .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
                    .locator(`[value=${fieldName}]`),
            });
            await row.hover();

            await row.locator(slct(DatasetFieldsTabQa.FieldSettingsColumnIcon)).click();

            const dialog = page.locator(slct(DatasetFieldSettingsDialogQa.Dialog));
            await expect(dialog).toBeVisible();

            await dialog.locator(slct(DatasetFieldSettingsDialogQa.ColorSettingsButton)).click();

            const colorsDialog = page.locator(slct(DatasetFieldColorsDialogQa.Dialog));
            await expect(colorsDialog).toBeVisible();

            const setColor = async (valueItemIndex: number, paletteItemIndex: number) => {
                const valueListItem = colorsDialog
                    .locator(slct(DatasetFieldColorsDialogQa.ValueItem))
                    .nth(valueItemIndex);
                await valueListItem.click();

                const paletteItem = colorsDialog
                    .locator(slct(DatasetFieldColorsDialogQa.PaleteItem))
                    .nth(paletteItemIndex);
                const paletteItemColor = await paletteItem.evaluate(
                    (node) => node.style.backgroundColor,
                );
                await paletteItem.click();

                const valueItemIcon = colorsDialog
                    .locator(slct(DatasetFieldColorsDialogQa.ValueItemColorIcon))
                    .nth(valueItemIndex);
                await expect(valueItemIcon).toHaveCSS('background-color', paletteItemColor);
            };

            const colorIndex = 0;
            await setColor(0, colorIndex);
            await setColor(1, colorIndex);
        });
    });
});
