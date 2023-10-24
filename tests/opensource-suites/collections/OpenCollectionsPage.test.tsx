import {Page} from '@playwright/test';

import {openTestPage} from '../../utils';
import datalensTest from '../../utils/playwright/globalTestDefinition';

datalensTest.describe('@open Collections page', () => {
    datalensTest('Open page', async ({page}: {page: Page}) => {
        await openTestPage(page, `/collections`);
    });
});
