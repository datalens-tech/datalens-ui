import {Page, expect} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ActionPanelQA} from '../../../../src/shared';

const dashboardKey = 'at6wshbewj36x-fixed-header-tests';
const tabsIds = {
    twoGroups: 'X5',
    onlySecondGroup: 'Ja',
    overflownSecondGroup: 'vJ',
};

function getTabUrl(tabName: string) {
    return `/${dashboardKey}?tab=${tabName}`;
}

datalensTest.describe('Fixed header', () => {
    datalensTest('Header with 2 groups', async ({page}: {page: Page}) => {
        await openTestPage(page, getTabUrl(tabsIds.twoGroups));
        const dashboardPage = new DashboardPage({page});
        const fixedHeader = dashboardPage.fixedHeader;
        const actionPanelHeight =
            (await dashboardPage.page.locator(slct(ActionPanelQA.ActionPanel)).boundingBox())
                ?.height ?? 0;

        const collapsibleStateToggleButton = fixedHeader.expandCollapseButton;

        await expect(collapsibleStateToggleButton).toBeVisible();
        await expect(fixedHeader.controls).toBeVisible();
        await expect(fixedHeader.container).toBeVisible();

        // check that "fixed" header is not fixed without scrolling
        expect(await fixedHeader.getWrapperVerticalOffset()).toBeGreaterThan(actionPanelHeight);

        await fixedHeader.toggleFixedHeaderCollapsibleState(); // collapse

        await expect(collapsibleStateToggleButton).toBeVisible();
        await expect(fixedHeader.controls).toBeVisible();
        await expect(fixedHeader.container).toBeHidden();

        await page.mouse.wheel(0, 500);

        await expect(collapsibleStateToggleButton).toBeVisible();
        await expect(fixedHeader.controls).toBeVisible();
        await expect(fixedHeader.container).toBeHidden();

        expect(await fixedHeader.getWrapperVerticalOffset()).toEqual(actionPanelHeight);

        await fixedHeader.toggleFixedHeaderCollapsibleState(); // expand

        await expect(fixedHeader.container).toBeVisible();
    });

    datalensTest('With second group only', async ({page}: {page: Page}) => {
        await openTestPage(page, getTabUrl(tabsIds.onlySecondGroup));
        const dashboardPage = new DashboardPage({page});
        const fixedHeader = dashboardPage.fixedHeader;
        const actionPanelHeight =
            (await dashboardPage.page.locator(slct(ActionPanelQA.ActionPanel)).boundingBox())
                ?.height ?? 0;

        const collapsibleStateToggleButton = fixedHeader.expandCollapseButton;

        await expect(collapsibleStateToggleButton).toBeVisible();
        await expect(fixedHeader.controls).toBeHidden();
        await expect(fixedHeader.container).toBeVisible();

        // check that "fixed" header is not fixed without scrolling
        expect(await fixedHeader.getWrapperVerticalOffset()).toBeGreaterThan(actionPanelHeight);

        await fixedHeader.toggleFixedHeaderCollapsibleState(); // collapse

        await expect(collapsibleStateToggleButton).toBeVisible();
        await expect(fixedHeader.controls).toBeHidden();
        await expect(fixedHeader.container).toBeHidden();

        await page.mouse.wheel(0, 500);

        await expect(collapsibleStateToggleButton).toBeVisible();
        await expect(fixedHeader.controls).toBeHidden();
        await expect(fixedHeader.container).toBeHidden();

        await fixedHeader.toggleFixedHeaderCollapsibleState(); // expand

        await expect(fixedHeader.container).toBeVisible();

        expect(await fixedHeader.getWrapperVerticalOffset()).toEqual(actionPanelHeight);
    });
    datalensTest('Header with overflown second group', async ({page}: {page: Page}) => {
        await openTestPage(page, getTabUrl(tabsIds.overflownSecondGroup));
        const dashboardPage = new DashboardPage({page});
        const fixedHeader = dashboardPage.fixedHeader;
        const actionPanelHeight =
            (await dashboardPage.page.locator(slct(ActionPanelQA.ActionPanel)).boundingBox())
                ?.height ?? 0;

        const collapsibleStateToggleButton = fixedHeader.expandCollapseButton;

        await expect(collapsibleStateToggleButton).toBeVisible();
        await expect(fixedHeader.controls).toBeVisible();
        await expect(fixedHeader.container).toBeVisible();

        const body = page.locator('body');

        // check that "fixed" header is not fixed without scrolling
        expect(await fixedHeader.getWrapperVerticalOffset()).toBeGreaterThan(actionPanelHeight);

        await page.mouse.wheel(0, 500);

        const bodyScrollPositionBeforeCollapsing = (await body.boundingBox())?.y ?? 0;
        const fixedHeaderScrollPositionBeforeCollapsing =
            (await fixedHeader.container.boundingBox())?.y ?? 0;

        await fixedHeader.container.hover();
        await page.mouse.wheel(0, 500);

        expect((await body.boundingBox())?.y).toEqual(bodyScrollPositionBeforeCollapsing);
        expect((await fixedHeader.container.boundingBox())?.y).toEqual(
            fixedHeaderScrollPositionBeforeCollapsing - 500,
        );

        await fixedHeader.toggleFixedHeaderCollapsibleState(); // collapse

        await expect(collapsibleStateToggleButton).toBeVisible();
        await expect(fixedHeader.controls).toBeVisible();
        await expect(fixedHeader.container).toBeHidden();

        await page.mouse.wheel(0, 500);
        expect((await body.boundingBox())?.y).toEqual(bodyScrollPositionBeforeCollapsing - 500);
    });
});
