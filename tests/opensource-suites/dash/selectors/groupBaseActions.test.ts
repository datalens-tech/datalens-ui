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
        controlTitle: 'test-control-1',
        controlItems: ['91000', '98800'],
        controlFieldName: 'test-control-field',
    },
    SECOND_CONTROL: {
        controlTitle: 'test-control-2',
        controlItems: ['1', '2'],
        controlFieldName: 'test-control-field-2',
    },
    THIRD_CONTROL: {
        controlTitle: 'test-control-3',
        controlItems: ['3', '4'],
        controlFieldName: 'test-control-field-3',
    },
    OLD_CONTROL_TITLE: 'city',
    OLD_SELECTOR_TAB: 'Tab 2',
};

const getSelectorsLabels = async (page: Page) => {
    const controlLabelLocator = page.locator(slct(ControlQA.controlLabel));
    const firstLabelLocator = controlLabelLocator.first();

    // if one of selectors is visible, group selector is loaded
    await expect(firstLabelLocator).toBeVisible();
    const allLabelsLocators = await controlLabelLocator.all();
    const labels = await Promise.all(
        allLabelsLocators.map((locator) => locator.getAttribute('title')),
    );

    return labels;
};

datalensTest.describe('Dashboards - Base actions with group selectors', () => {
    datalensTest.beforeAll(async ({page}: {page: Page}) => {
        // some page need to be loaded so we can get data of feature flag from DL var
        await openTestPage(page, '/');

        const isEnabledGroupControls = await isEnabledFeature(page, Feature.GroupControls);

        if (!isEnabledGroupControls) {
            datalensTest.skip();
        }
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash();
    });

    datalensTest(
        'Selector is successfully added and removed from selectors group',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            // adding selector to existing group
            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addSelector(PARAMS.FIRST_CONTROL);
                },
            });

            await dashboardPage.enterEditMode();
            await dashboardPage.clickFirstControlSettingsButton();
            await dashboardPage.dialogControl.waitForVisible();
            await dashboardPage.addSelectorToGroup(PARAMS.SECOND_CONTROL);

            await page.click(slct(ControlQA.dialogControlApplyBtn));

            await dashboardPage.clickSaveButton(true);

            const multipleControlsCount = await page
                .locator(slct(ControlQA.chartkitControl))
                .count();
            expect(multipleControlsCount).toBe(2);

            // removing selector from existing group
            await dashboardPage.enterEditMode();

            await dashboardPage.clickFirstControlSettingsButton();
            await dashboardPage.dialogControl.waitForVisible();

            // we need to hover item to show control menu
            await page.locator(slct(TabMenuQA.Item)).nth(1).hover();
            await page.locator(slct(DialogGroupControlQa.controlMenu)).nth(1).click();

            await page.locator(slct(DialogGroupControlQa.removeControlButton)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();

            await dashboardPage.clickSaveButton(true);

            const singleControlCount = await page.locator(slct(ControlQA.chartkitControl)).count();
            expect(singleControlCount).toBe(1);
        },
    );

    datalensTest(
        'Old single selector is transformed into a new one on saving after editing and it does not change its size',
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

            await dashboardPage.dialogControl.waitForVisible();
            await expect(page.locator(slct(TabMenuQA.List))).toBeVisible();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();

            await dashboardPage.saveChanges();

            const updatedSelector = await selectorContainerLocator.elementHandle();
            const newBoundingBox = await updatedSelector?.boundingBox();

            expect(oldBoundingBox?.height).toEqual(newBoundingBox?.height);
            expect(oldBoundingBox?.width).toEqual(newBoundingBox?.width);
        },
    );

    datalensTest(
        'Order of selectors in group changes after editing their placement',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            // adding selector to existing group
            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addSelectorsGroup([
                        PARAMS.FIRST_CONTROL,
                        PARAMS.SECOND_CONTROL,
                    ]);
                },
            });

            // check the order of selectors by their labels
            const initialLabels = await getSelectorsLabels(page);

            expect(initialLabels).toEqual(['test-control-1', 'test-control-2']);

            await dashboardPage.enterEditMode();
            await dashboardPage.clickFirstControlSettingsButton();
            await dashboardPage.dialogControl.waitForVisible();
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

            const changedLabels = await getSelectorsLabels(page);

            expect(changedLabels).toEqual(['test-control-2', 'test-control-1']);
        },
    );
});
