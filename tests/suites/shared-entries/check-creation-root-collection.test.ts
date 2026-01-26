import {expect} from '@playwright/test';

import {CollectionsPagePO} from '../../page-objects/collections';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../utils';
import {CollectionActionsQa} from '../../../src/shared';

datalensTest.describe('Shared entries check create root collection', () => {
    datalensTest(
        'Shared objects create buttons should not be visible in root collection @yc',
        async ({page}) => {
            const collectionPage = new CollectionsPagePO({page});

            await openTestPage(page, 'collections');

            const btn = await collectionPage.waitForSelector(
                slct(CollectionActionsQa.CreateActionBtn),
            );
            await btn.click();
            const sharedObjectsMenuItem = page.locator(
                slct(CollectionActionsQa.SharedObjectsMenuItem),
            );
            await expect(sharedObjectsMenuItem).toHaveCount(0);
        },
    );
});
