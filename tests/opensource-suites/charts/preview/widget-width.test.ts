import type {Page} from '@playwright/test';
import {expect} from '@playwright/test';

import {PreviewQa} from '../../../../src/shared';
import type {TestParametrizationConfig} from '../../../types/config';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Charts Preview', () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            await openTestPage(page, config.charts.urls.FlatTableWithOneColumn);

            const initHeight = page.viewportSize()?.height;
            if (initHeight) {
                await page.setViewportSize({width: 800, height: initHeight});
            }
        },
    );

    // check that the table occupies 100% of the screen width, there is no horizontal scrolling
    datalensTest('Table widget must be the same @screenshot', async ({page}) => {
        const chartWrapper = page.locator(slct(PreviewQa.ChartWrapper));
        const firstTableCell = page.locator('td').first();

        await firstTableCell.waitFor();
        await expect(chartWrapper).toHaveScreenshot();
    });
});
