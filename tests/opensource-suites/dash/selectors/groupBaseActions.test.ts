import {Page} from '@playwright/test';

import {
    ControlQA,
    DashkitQa,
    DialogGroupControlQa,
    Feature,
    TabMenuQA,
} from '../../../../src/shared';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {isEnabledFeature, openTestPage, slct} from '../../../utils';
import {TestParametrizationConfig} from '../../../types/config';
import {dragAndDropListItem} from '../../../suites/dash/helpers';

const PARAMS = {
    FIRST_CONTROL: {
        appearance: {title: 'test-control-1'},
        items: ['91000', '98800'],
        fieldName: 'test-control-field',
    },
    SECOND_CONTROL: {
        appearance: {title: 'test-control-2'},
        items: ['1', '2'],
        fieldName: 'test-control-field-2',
    },
    OLD_CONTROL_TITLE: 'city',
    OLD_SELECTOR_TAB: 'Tab 2',
};

datalensTest.describe('Dashboards - Base actions with group selectors', () => {
    let skipAfterEach = false;

    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        // some page need to be loaded so we can get data of feature flag from DL var
        await openTestPage(page, '/');

        const isEnabledGroupControls = await isEnabledFeature(page, Feature.GroupControls);

        if (!isEnabledGroupControls) {
            skipAfterEach = true;
            // Test is immediately aborted when you call skip, it goes straight to afterEach
            datalensTest.skip();
        }
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        if (skipAfterEach) {
            return;
        }

        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash();
    });

    datalensTest(
        'Old single selector is successfully saved as a group selector, new selectors are successfully added and removed from the group',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            // open the dashboard with a selector on one of the tabs
            await openTestPage(page, config.dash.urls.DashboardWithTabsAndSelectors);
            await dashboardPage.duplicateDashboard({
                dashId: config.dash.urls.DashboardWithTabsAndSelectors,
                useUserFolder: true,
            });

            await dashboardPage.changeTab({tabName: PARAMS.OLD_SELECTOR_TAB});

            const selectorContainerLocator = page.locator(slct(DashkitQa.GRID_ITEM));

            const oldSelector = await selectorContainerLocator.elementHandle();
            const oldBoundingBox = await oldSelector?.boundingBox();

            await dashboardPage.enterEditMode();
            await dashboardPage.clickFirstControlSettingsButton();

            await dashboardPage.controlActions.waitForDialog();
            await expect(page.locator(slct(TabMenuQA.List))).toBeVisible();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();

            await dashboardPage.saveChanges();

            const updatedSelector = await selectorContainerLocator.elementHandle();
            const newBoundingBox = await updatedSelector?.boundingBox();

            expect(oldBoundingBox?.height).toEqual(newBoundingBox?.height);
            expect(oldBoundingBox?.width).toEqual(newBoundingBox?.width);

            await page.reload();

            await dashboardPage.enterEditMode();
            await dashboardPage.clickFirstControlSettingsButton();

            // add new selector to the previously saved group
            await dashboardPage.controlActions.waitForDialog();
            await dashboardPage.controlActions.addSelectorToGroup(PARAMS.SECOND_CONTROL);

            await page.click(slct(ControlQA.dialogControlApplyBtn));

            await dashboardPage.saveChanges();

            // check current selector count
            const multipleControlsCount = await page
                .locator(slct(ControlQA.chartkitControl))
                .count();
            expect(multipleControlsCount).toBe(2);

            // remove selector from existing group
            await dashboardPage.enterEditMode();

            await dashboardPage.clickFirstControlSettingsButton();
            await dashboardPage.controlActions.waitForDialog();

            // we need to hover item to show control menu
            await page.locator(slct(TabMenuQA.Item)).nth(1).hover();
            await page.locator(slct(DialogGroupControlQa.controlMenu)).nth(1).click();

            await page.locator(slct(DialogGroupControlQa.removeControlButton)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();

            await dashboardPage.saveChanges();

            const singleControlCount = await page.locator(slct(ControlQA.chartkitControl)).count();
            expect(singleControlCount).toBe(1);
        },
    );

    datalensTest(
        'Order of selectors in group changes after editing their placement',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            // adding selector to existing group
            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup([
                        PARAMS.FIRST_CONTROL,
                        PARAMS.SECOND_CONTROL,
                    ]);
                },
            });

            // check the order of selectors by their labels
            const initialLabels = await dashboardPage.getGroupSelectorLabels();

            expect(initialLabels).toEqual(['test-control-1', 'test-control-2']);

            await dashboardPage.enterEditMode();
            await dashboardPage.clickFirstControlSettingsButton();
            await dashboardPage.controlActions.waitForDialog();
            await page.locator(slct(DialogGroupControlQa.placementButton)).click();

            // the controls of placement prevent you from clicking on the middle of item, so
            // moveXRation is 3 (x position of click is width of item / 3)
            await dragAndDropListItem(page, {
                listSelector: slct(DialogGroupControlQa.placementControlList),
                sourceIndex: 0,
                targetIndex: 1,
                moveXRation: 3,
            });

            await page.locator(slct(DialogGroupControlQa.placementApplyButton)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();

            await dashboardPage.saveChanges();

            const changedLabels = await dashboardPage.getGroupSelectorLabels();

            expect(changedLabels).toEqual(['test-control-2', 'test-control-1']);
        },
    );
});
