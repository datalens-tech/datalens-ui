import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

import {DashkitQa, DialogTabsQA, EntryDialogQA} from '../../../../src/shared/constants';
import {dragAndDropListItem, openTabPopupWidgetOrder} from '../../../suites/dash/helpers';
import {arbitraryText} from '../constants';
import {ActionPanelDashSaveControlsQa} from '../../../../src/shared/constants/qa/action-panel';

const SELECTORS = {
    SELECTOR_LIST_ITEMS: '.g-list__item',
};

datalensTest.describe(`Dashboards - Change widgets order on tab`, () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addTitle(arbitraryText.first);
                await dashboardPage.addTitle(arbitraryText.second);
            },
        });
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'Widget order is successfully reset when order changes are undone',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();

            const popupWidgetOrderList = await openTabPopupWidgetOrder(dashboardPage, 0);

            const widgetOrderListItems = await popupWidgetOrderList.$$(
                SELECTORS.SELECTOR_LIST_ITEMS,
            );
            const factWidgetOrder = await Promise.all(
                widgetOrderListItems.map((widget) => widget.textContent()),
            );

            await dragAndDropListItem(page, {
                listSelector: slct(DialogTabsQA.PopupWidgetOrderList),
                sourceIndex: 0,
                targetIndex: 1,
            });

            const actualWidgetOrderListItems = await popupWidgetOrderList.$$(
                SELECTORS.SELECTOR_LIST_ITEMS,
            );
            const actualWidgetOrder = await Promise.all(
                actualWidgetOrderListItems.map((widget) => widget.textContent()),
            );
            expect(factWidgetOrder.reverse()).toEqual(actualWidgetOrder);

            await page.click(slct(EntryDialogQA.Apply));
            await page.click(slct(DialogTabsQA.Cancel));

            await dashboardPage.waitForSelector(
                `${slct(ActionPanelDashSaveControlsQa.Save)}[disabled]`,
            );

            await dashboardPage.exitEditMode();
        },
    );

    datalensTest(
        'Widget order is successfully reset when exiting dashboard editing mode',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();

            let popupWidgetOrderList = await openTabPopupWidgetOrder(dashboardPage, 0);

            const widgetOrderListItems = await popupWidgetOrderList.$$(
                SELECTORS.SELECTOR_LIST_ITEMS,
            );
            const factWidgetOrder = await Promise.all(
                widgetOrderListItems.map((widget) => widget.textContent()),
            );
            expect(factWidgetOrder.length).toBeGreaterThan(0);

            await dragAndDropListItem(page, {
                listSelector: slct(DialogTabsQA.PopupWidgetOrderList),
                sourceIndex: 0,
                targetIndex: 1,
            });

            await page.click(slct(EntryDialogQA.Apply));
            await page.click(slct(DialogTabsQA.Save));

            await dashboardPage.waitForSelector(
                `${slct(ActionPanelDashSaveControlsQa.Save)}:not([disabled])`,
            );
            await dashboardPage.exitEditMode();

            const dashGridItems = await page.$$(slct(DashkitQa.GRID_ITEM));
            const dashWidgetsCount = dashGridItems.length;
            expect(dashWidgetsCount).toEqual(factWidgetOrder.length);

            await dashboardPage.enterEditMode();

            // open popup widget order again
            popupWidgetOrderList = await openTabPopupWidgetOrder(dashboardPage, 0);

            const actualWidgetOrderListItems = await popupWidgetOrderList.$$(
                SELECTORS.SELECTOR_LIST_ITEMS,
            );
            const actualWidgetOrder = await Promise.all(
                actualWidgetOrderListItems.map((widget) => widget.textContent()),
            );
            expect(factWidgetOrder).toEqual(actualWidgetOrder);

            await page.click(slct(EntryDialogQA.Cancel));
            await page.click(slct(DialogTabsQA.Cancel));

            await dashboardPage.exitEditMode();
        },
    );
});
