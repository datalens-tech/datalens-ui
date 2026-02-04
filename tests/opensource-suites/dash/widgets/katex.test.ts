import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {slct} from '../../../utils';
import {DashkitQa} from '../../../../src/shared';

const katex = `Module $a$ is greater than 0:

#|
||

$|a| > 0$

||
|#`;

datalensTest.describe('Dashboards. Text widget.', () => {
    datalensTest('KaTeX-formula inside the table @screenshot', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () =>
                await dashboardPage.addText({text: katex, timeout: 20, markup: true}),
        });
        const textWidget = page.locator(slct(DashkitQa.GRID_ITEM)).first();

        await expect(textWidget).toBeVisible();
        await expect(textWidget).toHaveScreenshot();
    });
});
