import {Page} from '@playwright/test';

import {waitForCondition, slct} from '../../utils';
import {DialogTabsQA} from '../../../src/shared/constants';
import type DashboardPage from '../../page-objects/dashboard/DashboardPage';

const SELECTORS = {
    TABLE_CELL_CONTENT: '.chartkit-table__content_text',
    LIST_ITEM: '.g-list__item',
    TAB_ROW: '.dialog-tab-item__row',
};

export async function waitForTableRowsToEqual(page: Page, expectedValues: string[]) {
    let actualValues: string[] = [];

    await waitForCondition(async () => {
        const cellSelectors = await page.$$(SELECTORS.TABLE_CELL_CONTENT);

        actualValues = await Promise.all(cellSelectors.map((selector) => selector.innerText()));

        return expectedValues.join() === actualValues.join();
    }).catch(() => {
        expect(actualValues).toEqual(expectedValues);
    });
}

// default page.dragAndDrop does not work on list
// note: it can be unstable when the number of items is more than 2
export async function dragAndDropListItem(
    page: Page,
    {
        listSelector,
        itemSelector,
        sourceIndex,
        targetIndex,
        // affects the mouse events position, default is half of item (width / moveXRation)
        moveXRation = 2,
    }: {
        listSelector: string;
        itemSelector?: string;
        sourceIndex: number;
        targetIndex: number;
        moveXRation?: number;
    },
) {
    const list = await page.$(listSelector);

    if (!list) {
        throw new Error(`drag and drop list not found: ${listSelector}`);
    }

    const listItems = await list.$$(itemSelector || SELECTORS.LIST_ITEM);

    expect(listItems.length).toBeGreaterThan(Math.max(sourceIndex, targetIndex));

    const sourceItem = listItems[sourceIndex];
    const targetItem = listItems[targetIndex];

    const sourceItemBox = await sourceItem.boundingBox();
    if (!sourceItemBox) {
        throw new Error('drag and drop source item box is null');
    }

    const targetItemBox = await targetItem.boundingBox();
    if (!targetItemBox) {
        throw new Error('drag and drop target item box is null');
    }

    await page.mouse.move(
        sourceItemBox.x + sourceItemBox.width / moveXRation,
        sourceItemBox.y + sourceItemBox.height / 2,
    );
    await page.mouse.down();

    // item shake emulation for drag event trigger
    await page.mouse.move(
        sourceItemBox.x + sourceItemBox.width / moveXRation,
        sourceItemBox.y - sourceItemBox.height,
    );
    await page.mouse.move(
        sourceItemBox.x + sourceItemBox.width / moveXRation,
        sourceItemBox.y + sourceItemBox.height,
    );

    // move source item to the end of target item
    await page.mouse.move(
        targetItemBox.x + targetItemBox.width / moveXRation,
        targetItemBox.y - targetItemBox.height / 2,
    );

    await page.mouse.up();

    // to let drop animation be finished before next actions
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });
}

export async function openTabPopupWidgetOrder(dashboardPage: DashboardPage, tabIndex?: number) {
    await dashboardPage.clickTabs();
    const tabsDialog = await dashboardPage.waitForSelector(slct(DialogTabsQA.Dialog));

    const tabsRows = await tabsDialog.$$(SELECTORS.TAB_ROW);
    expect(tabsRows.length).toBeGreaterThan(tabIndex || 0);
    const tabRow = tabsRows[tabIndex || 0];

    const tabRowDropdown = await tabRow.$(slct(DialogTabsQA.TabItemMenu));
    await tabRowDropdown?.click({force: true});

    await dashboardPage.page.click(`[data-qa="${DialogTabsQA.TabItemMenuOrder}"]`);
    await dashboardPage.waitForSelector(slct(DialogTabsQA.PopupWidgetOrder));
    const popupWidgetOrderList = await dashboardPage.waitForSelector(
        slct(DialogTabsQA.PopupWidgetOrderList),
    );

    return popupWidgetOrderList;
}

export const getUrlStateParam = (page: Page): string | null => {
    const pageURL = new URL(page.url());
    return pageURL.searchParams.get('state');
};
