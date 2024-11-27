import {Page} from '@playwright/test';

import {CollectionsPageQa} from '../../../../src/shared';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {setViewportSizeAsContent} from '../../utils';

datalensTest.describe('Collections page', () => {
    datalensTest(
        'Collections page displays list of collections and workbooks @screenshot',
        async ({page}: {page: Page}) => {
            await page.clock.setFixedTime(new Date('2025-01-01T10:00:00'));

            await openTestPage(page, `/collections`);

            const pageContainer = page.locator(slct(CollectionsPageQa.PageContainer));

            await setViewportSizeAsContent(page, slct(CollectionsPageQa.PageContainer));

            await expect(pageContainer).toHaveScreenshot();
        },
    );
});
