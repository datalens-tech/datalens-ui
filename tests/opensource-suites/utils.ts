import {expect, Page} from '@playwright/test';
import {slct} from '../utils';
import {DlNavigationQA, WorkbookNavigationMinimalQa} from '../../src/shared';

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
