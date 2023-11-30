import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, slct} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

import {WorkbooksUrls} from 'constants/constants';
import {Workbook} from 'page-objects/workbook/Workbook';
import {COMMON_DASH_SELECTORS} from 'suites/dash/constants';
import {DialogTabsQA, EntryDialogQA} from '../../../../src/shared/constants';
import {dragAndDropListItem, openTabPopupWidgetOrder} from '../../../suites/dash/helpers';
import {arbitraryText} from './constants';

const SELECTORS = {
    SELECTOR_LIST_ITEMS: '.yc-list__item',
};

datalensTest.describe(`Dashboards - change widgets order on tab`, () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        const workbookPO = new Workbook(page);

        await workbookPO.openE2EWorkbookPage();

        await workbookPO.createDashboard({
            editDash: async () => {
                await dashboardPage.addText(arbitraryText.first);
                await dashboardPage.addText(arbitraryText.second);
            },
        });
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
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
                `${slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_BTN)}[disabled]`,
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
                `${slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_BTN)}:not([disabled])`,
            );
            await dashboardPage.exitEditMode();

            const dashGridItems = await page.$$(slct(COMMON_DASH_SELECTORS.DASH_GRID_ITEM));
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
