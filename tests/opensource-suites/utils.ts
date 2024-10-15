import {Page, expect} from '@playwright/test';

import {
    DlNavigationQA,
    PaletteEditorQA,
    ServiceSettingsQA,
    WorkbookNavigationMinimalQa,
} from '../../src/shared';
import {openTestPage, slct} from '../utils';

export async function selectEntryFromNavigationMenu(page: Page, datasetName: string) {
    const searchInput = page
        .locator(
            [slct(WorkbookNavigationMinimalQa.Input), slct(DlNavigationQA.SearchInput)].join(' ,'),
        )
        .getByRole('textbox');
    await searchInput.fill(datasetName);

    const resultsFound = page
        .locator([slct(WorkbookNavigationMinimalQa.List), slct(DlNavigationQA.Row)].join(' ,'))
        .getByText(datasetName, {exact: true});

    await expect(resultsFound).toBeVisible();
    await resultsFound.click();
}

export async function addCustomPalette(page: Page, palette: {name: string; colors?: string[]}) {
    const {name, colors = ['4fc4b7', '59abc9', '8ccce3', 'b9e4f3', 'e0f1fa']} = palette;

    await openTestPage(page, '/settings');
    await page
        .locator(slct(ServiceSettingsQA.ColorPalettes))
        .locator(slct(ServiceSettingsQA.AddPaletteButton))
        .click();

    await page.locator(slct(PaletteEditorQA.PaletteNameInput)).getByRole('textbox').fill(name);

    const removeColorButton = page.locator(slct(PaletteEditorQA.RemoveColorButton)).first();
    while (await removeColorButton.isVisible()) {
        await removeColorButton.click();
    }

    const colorInput = page
        .locator(slct(PaletteEditorQA.ColorTextInput))
        .last()
        .getByRole('textbox');
    await colorInput.fill(colors[0]);
    for (let i = 1; i < colors.length; i++) {
        await page.locator(slct(PaletteEditorQA.AddColorButton)).click();
        await colorInput.fill(colors[i]);
    }

    await page.locator(slct(PaletteEditorQA.ApplyButton)).click();
}

// useful for scrollable content as playwright doesn't make screenshot
// of content outside the viewport
export const setViewportSizeAsContent = async (page: Page, selector: string) => {
    const currentViewport = page.viewportSize();

    const contentHeight = await page.evaluate((selector) => {
        const app = document.querySelector(selector);
        return app?.scrollHeight;
    }, selector);

    if (!currentViewport?.width || !contentHeight) {
        return;
    }

    await page.setViewportSize({
        width: currentViewport.width,
        height: contentHeight,
    });
};
