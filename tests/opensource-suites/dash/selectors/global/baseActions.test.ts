import {Page, expect} from '@playwright/test';

import {ControlQA, DialogControlQa, Feature, UikitListQa} from '../../../../../src/shared';
import DashboardPage from '../../../../page-objects/dashboard/DashboardPage';
import {isEnabledFeature, openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    GLOBAL_SELECTOR_ALL_TABS: {
        appearance: {title: 'All Tabs'},
        items: ['Value 1'],
        fieldName: 'global-field-all',
    },
    GLOBAL_SELECTOR_SELECTED_TABS: {
        appearance: {title: 'Selected Tabs'},
        items: ['Option A'],
        fieldName: 'global-field-selected',
    },
};

datalensTest.describe('Dashboards - Global selectors with impact type base actions', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        // some page need to be loaded so we can get data of feature flag from DL var
        await openTestPage(page, '/');
        const isEnabledGlobalSelectors = await isEnabledFeature(
            page,
            Feature.EnableGlobalSelectors,
        );

        if (!isEnabledGlobalSelectors) {
            datalensTest.skip();
        }
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'Creating a global selector with "All Tabs" impact type - selector appears on all tabs',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addTab();

                    await dashboardPage.controlActions.addSelector({
                        ...PARAMS.GLOBAL_SELECTOR_ALL_TABS,
                        defaultValue: PARAMS.GLOBAL_SELECTOR_ALL_TABS.items[0],
                        impactType: 'allTabs',
                    });

                    // Created global selector with the allTabs scope should appear on a new tab
                    await dashboardPage.addTab();
                },
            });

            // Verify selector appears on Tab 1
            const selectorOnTab1 = dashboardPage.getSelectorLocatorByTitle({
                title: PARAMS.GLOBAL_SELECTOR_ALL_TABS.appearance.title,
            });
            await expect(selectorOnTab1).toBeVisible();
            await expect(selectorOnTab1).toContainText(PARAMS.GLOBAL_SELECTOR_ALL_TABS.items[0]);

            // Switch to Tab 2 and verify selector is visible
            await dashboardPage.changeTab({index: 1});
            const selectorOnTab2 = dashboardPage.getSelectorLocatorByTitle({
                title: PARAMS.GLOBAL_SELECTOR_ALL_TABS.appearance.title,
            });
            await expect(selectorOnTab2).toBeVisible();

            // Switch to Tab 3 and verify selector is visible
            await dashboardPage.changeTab({index: 2});
            const selectorOnTab3 = dashboardPage.getSelectorLocatorByTitle({
                title: PARAMS.GLOBAL_SELECTOR_ALL_TABS.appearance.title,
            });
            await expect(selectorOnTab3).toBeVisible();
        },
    );

    datalensTest(
        'Creating a global selector with "Selected Tabs" impact type - selector appears only on selected tabs',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addTab();
                    await dashboardPage.addTab();

                    // Add selector with "Selected Tabs" impact type
                    await dashboardPage.controlActions.addSelector({
                        ...PARAMS.GLOBAL_SELECTOR_SELECTED_TABS,
                        defaultValue: PARAMS.GLOBAL_SELECTOR_SELECTED_TABS.items[0],
                        impactType: 'selectedTabs',
                        // Tab 1 is selected by default
                        impactTabsIndexes: [1],
                    });
                },
            });

            // Verify selector appears on Tab 1
            const selectorTitle = PARAMS.GLOBAL_SELECTOR_SELECTED_TABS.appearance.title;
            const selectorOnTab1 = dashboardPage.getSelectorLocatorByTitle({
                title: selectorTitle,
            });
            await expect(selectorOnTab1).toBeVisible();
            await expect(selectorOnTab1).toContainText(
                PARAMS.GLOBAL_SELECTOR_SELECTED_TABS.items[0],
            );

            // Switch to Tab 2 and verify selector is visible
            await dashboardPage.changeTab({index: 1});
            const selectorOnTab2 = dashboardPage.getSelectorLocatorByTitle({
                title: selectorTitle,
            });
            await expect(selectorOnTab2).toBeVisible();

            // Switch to Tab 3 and verify selector is NOT visible
            await dashboardPage.changeTab({index: 2});
            const selectorOnTab3 = page.locator(slct(ControlQA.chartkitControl)).filter({
                hasText: selectorTitle,
            });
            await expect(selectorOnTab3).not.toBeVisible();
        },
    );

    datalensTest(
        'Editing global selector - changing from "All Tabs" to "Selected Tabs" updates visibility',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addTab();
                    await dashboardPage.addTab();

                    await dashboardPage.controlActions.addSelector({
                        ...PARAMS.GLOBAL_SELECTOR_ALL_TABS,
                        defaultValue: PARAMS.GLOBAL_SELECTOR_ALL_TABS.items[0],
                        impactType: 'allTabs',
                    });
                },
            });

            // Verify selector is visible on all tabs initially
            const selectorTitle = PARAMS.GLOBAL_SELECTOR_ALL_TABS.appearance.title;
            await expect(
                dashboardPage.getSelectorLocatorByTitle({title: selectorTitle}),
            ).toBeVisible();

            await dashboardPage.changeTab({index: 1});
            await expect(
                dashboardPage.getSelectorLocatorByTitle({title: selectorTitle}),
            ).toBeVisible();

            await dashboardPage.changeTab({index: 2});
            await expect(
                dashboardPage.getSelectorLocatorByTitle({title: selectorTitle}),
            ).toBeVisible();

            // Edit selector to change impact type to "Selected Tabs"
            await dashboardPage.changeTab({index: 0});
            await dashboardPage.enterEditMode();

            await dashboardPage.clickFirstControlSettingsButton();

            await dashboardPage.controlActions.editSelectorBySettings({
                impactType: 'selectedTabs',
                impactTabsIndexes: [1],
            });

            await dashboardPage.controlActions.applyControlSettings();
            await dashboardPage.saveChanges();

            // Verify that the setting value has not changed.
            await dashboardPage.enterEditMode();

            await dashboardPage.clickFirstControlSettingsButton();

            await dashboardPage.controlActions.dialogControl.impactTypeSelector.click();

            await expect(
                page
                    .locator(slct(UikitListQa.ACTIVE_ITEM))
                    .locator(slct(DialogControlQa.impactTypeValueSelectedTabs)),
            ).toBeVisible();

            // close popup of select
            await page.keyboard.press('Enter');

            const selectedText =
                await dashboardPage.controlActions.dialogControl.impactTabsIdsSelector
                    .getLocator()
                    .innerText();

            await expect(selectedText.split(',').length).toEqual(2);

            await dashboardPage.controlActions.applyControlSettings();
            await dashboardPage.exitEditMode();

            // Verify selector is visible on Tab 1
            await expect(
                dashboardPage.getSelectorLocatorByTitle({title: selectorTitle}),
            ).toBeVisible();

            // Verify selector is NOT visible on Tab 2
            await dashboardPage.changeTab({index: 1});
            const selectorOnTab2 = page.locator(slct(ControlQA.chartkitControl)).filter({
                hasText: selectorTitle,
            });
            await expect(selectorOnTab2).not.toBeVisible();

            // Verify selector is visible on Tab 3
            await dashboardPage.changeTab({index: 2});
            await expect(
                dashboardPage.getSelectorLocatorByTitle({title: selectorTitle}),
            ).toBeVisible();
        },
    );

    datalensTest(
        'Multiple selectors with different impact types coexist correctly',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            const CURRENT_TAB_SELECTOR = {
                appearance: {title: 'Current Tab Selector'},
                items: ['Local 1', 'Local 2'],
                fieldName: 'local-field',
            };

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addTab();
                    await dashboardPage.addTab();

                    // Add "All Tabs" selector
                    await dashboardPage.controlActions.addSelector({
                        ...PARAMS.GLOBAL_SELECTOR_ALL_TABS,
                        defaultValue: PARAMS.GLOBAL_SELECTOR_ALL_TABS.items[0],
                        impactType: 'allTabs',
                    });

                    await dashboardPage.clickFirstControlSettingsButton();

                    // Add "Selected Tabs" selector (Tab 1 and Tab 2)
                    await dashboardPage.controlActions.addSelectorToGroup({
                        ...PARAMS.GLOBAL_SELECTOR_SELECTED_TABS,
                        defaultValue: PARAMS.GLOBAL_SELECTOR_SELECTED_TABS.items[0],
                        impactType: 'selectedTabs',
                        // Tab 1 is selected by default
                        impactTabsIndexes: [1],
                    });

                    // Add "Current Tab" selector (default behavior)
                    await dashboardPage.controlActions.addSelectorToGroup({
                        ...CURRENT_TAB_SELECTOR,
                        defaultValue: CURRENT_TAB_SELECTOR.items[0],
                        impactType: 'currentTab',
                    });

                    await page.click(slct(ControlQA.dialogControlApplyBtn));
                },
            });

            // On Tab 1: all 3 selectors should be visible
            await expect(
                dashboardPage.getSelectorLocatorByTitle({
                    title: PARAMS.GLOBAL_SELECTOR_ALL_TABS.appearance.title,
                }),
            ).toBeVisible();
            await expect(
                dashboardPage.getSelectorLocatorByTitle({
                    title: PARAMS.GLOBAL_SELECTOR_SELECTED_TABS.appearance.title,
                }),
            ).toBeVisible();
            await expect(
                dashboardPage.getSelectorLocatorByTitle({
                    title: CURRENT_TAB_SELECTOR.appearance.title,
                }),
            ).toBeVisible();

            // On Tab 2: "All Tabs" and "Selected Tabs" should be visible, "Current Tab" should NOT
            await dashboardPage.changeTab({index: 1});
            await expect(
                dashboardPage.getSelectorLocatorByTitle({
                    title: PARAMS.GLOBAL_SELECTOR_ALL_TABS.appearance.title,
                }),
            ).toBeVisible();
            await expect(
                dashboardPage.getSelectorLocatorByTitle({
                    title: PARAMS.GLOBAL_SELECTOR_SELECTED_TABS.appearance.title,
                }),
            ).toBeVisible();
            const currentTabSelectorOnTab2 = page
                .locator(slct(ControlQA.chartkitControl))
                .filter({hasText: CURRENT_TAB_SELECTOR.appearance.title});
            await expect(currentTabSelectorOnTab2).not.toBeVisible();

            // On Tab 3: only "All Tabs" should be visible
            await dashboardPage.changeTab({index: 2});
            await expect(
                dashboardPage.getSelectorLocatorByTitle({
                    title: PARAMS.GLOBAL_SELECTOR_ALL_TABS.appearance.title,
                }),
            ).toBeVisible();
            const selectedTabsSelectorOnTab3 = page
                .locator(slct(ControlQA.chartkitControl))
                .filter({hasText: PARAMS.GLOBAL_SELECTOR_SELECTED_TABS.appearance.title});
            await expect(selectedTabsSelectorOnTab3).not.toBeVisible();
            const currentTabSelectorOnTab3 = page
                .locator(slct(ControlQA.chartkitControl))
                .filter({hasText: CURRENT_TAB_SELECTOR.appearance.title});
            await expect(currentTabSelectorOnTab3).not.toBeVisible();
        },
    );
});
