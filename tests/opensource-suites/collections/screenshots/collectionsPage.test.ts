import {Page} from '@playwright/test';

import {CollectionsPageQa} from '../../../../src/shared';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Collections page', () => {
    datalensTest(
        'Collections page displays list of collections and workbooks @screenshot',
        async ({page}: {page: Page}) => {
            await page.clock.setFixedTime(new Date('2025-01-01T10:00:00'));

            await openTestPage(page, `/collections`);

            const pageContainer = page.locator(slct(CollectionsPageQa.PageContainer));

            await page.setViewportSize({width: 1200, height: 500});

            await expect(pageContainer).toHaveScreenshot();
        },
    );
});
