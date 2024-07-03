import {Page, expect, Request} from '@playwright/test';

import {
    DashEntryQa,
    DialogControlQa,
    DialogGroupControlQa,
    Feature,
    TabMenuQA,
} from '../../../../src/shared';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {isEnabledFeature, openTestPage, slct} from '../../../utils';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {TestParametrizationConfig} from '../../../types/config';

const PARAMS = {
    MANUAL_CONTROL: {
        appearance: {
            title: 'parent control',
        },
        fieldName: 'element to duplicate',
        elementType: {
            qa: slct(DialogControlQa.typeControlInput),
        },
        required: true,
        defaultValue: 'default Value',
    },
    MANUAL_SECOND_CONTROL: {
        appearance: {
            title: 'copied control',
        },
        fieldName: 'duplicated',
        elementType: {
            qa: slct(DialogControlQa.typeControlInput),
        },
        required: false,
        defaultValue: 'another default value',
    },
    MANUAL_THIRD_CONTROL: {
        appearance: {
            title: 'third control',
        },
        fieldName: 'third',
    },
    TEST_TEXT: 'test text',
    OLD_SELECTOR_TAB: 'Tab 2',
    ADDITIONAL_TAB: 'Additional tab',
};

datalensTest.describe('Dashboards - Manipulations with configs', () => {
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
        'Selectors in the modal are duplicated and copied correctly',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelector(PARAMS.MANUAL_CONTROL);
                },
                waitingRequestOptions: {
                    controlTitles: [PARAMS.MANUAL_CONTROL.appearance.title],
                },
            });
            await dashboardPage.enterEditMode();
            await dashboardPage.clickFirstControlSettingsButton();
            await dashboardPage.controlActions.waitForDialog();

            // we need to hover item to show control menu
            await page.locator(slct(TabMenuQA.Item)).nth(0).hover();
            await page.locator(slct(DialogGroupControlQa.controlMenu)).click();
            await page.locator(slct(DialogGroupControlQa.duplicateControlButton)).click();

            const itemsCountAfterDuplicate = await page.locator(slct(TabMenuQA.Item)).count();

            expect(itemsCountAfterDuplicate).toEqual(2);

            await dashboardPage.controlActions.dialogControl.checkCurrentValues(
                PARAMS.MANUAL_CONTROL,
            );

            await page.locator(slct(TabMenuQA.Item)).nth(1).hover();
            await page.locator(slct(DialogGroupControlQa.controlMenu)).nth(1).click();
            await page.locator(slct(DialogGroupControlQa.copyControlButton)).click();

            await page.locator(slct(TabMenuQA.Paste)).click();

            const itemsCountAfterCopy = await page.locator(slct(TabMenuQA.Item)).count();

            expect(itemsCountAfterCopy).toEqual(3);

            await dashboardPage.controlActions.dialogControl.checkCurrentValues(
                PARAMS.MANUAL_CONTROL,
            );

            // try to save
            // saving should fail due to duplicate fields
            await dashboardPage.controlActions.applyControlSettings();

            await dashboardPage.controlActions.editSelectorBySettings(PARAMS.MANUAL_THIRD_CONTROL);

            await page.locator(slct(TabMenuQA.Item)).nth(1).click();

            await dashboardPage.controlActions.editSelectorBySettings(PARAMS.MANUAL_SECOND_CONTROL);

            await dashboardPage.controlActions.applyControlSettings();

            await dashboardPage.saveChanges();

            const changedLabels = await dashboardPage.getGroupSelectorLabels();

            // required field add * to title
            expect(changedLabels).toEqual([
                `${PARAMS.MANUAL_CONTROL.appearance.title}*`,
                PARAMS.MANUAL_SECOND_CONTROL.appearance.title,
                `${PARAMS.MANUAL_THIRD_CONTROL.appearance.title}*`,
            ]);
        },
    );

    datalensTest(
        'When resaving, the id of the selector is not lost',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelector(PARAMS.MANUAL_CONTROL);
                },
                waitingRequestOptions: {
                    controlTitles: [PARAMS.MANUAL_CONTROL.appearance.title],
                },
            });

            const apiRequest = page.waitForRequest(CommonUrls.ApiRun);

            const selectorLocator = dashboardPage.getSelectorLocatorByTitle({
                title: PARAMS.MANUAL_CONTROL.appearance.title,
                type: 'input',
            });

            await selectorLocator.locator('input').fill(PARAMS.TEST_TEXT);
            // click outside the selector to call blur and apply its value
            await page.locator(slct(DashEntryQa.EntryName)).click();

            const currentControlId = (await apiRequest).postDataJSON().config.data.shared.id;

            await dashboardPage.enterEditMode();
            await dashboardPage.clickFirstControlSettingsButton();
            await dashboardPage.controlActions.waitForDialog();

            await dashboardPage.controlActions.editSelectorBySettings({
                appearance: {title: PARAMS.TEST_TEXT},
            });

            await dashboardPage.controlActions.applyControlSettings();

            // check that a request with the same id is sent after the update
            const requestPromise = page.waitForRequest((request: Request) => {
                if (request.url().includes(CommonUrls.ApiRun)) {
                    expect(request.postDataJSON().config.data.shared.id).toEqual(currentControlId);
                    // waitForRequest is finished when callback returns true
                    return true;
                }
                return false;
            });

            await dashboardPage.saveChanges();

            await requestPromise;
        },
    );

    datalensTest(
        'Old selector can be copied from the dash and inserted into a group of selectors',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            // open the dashboard with a selector on one of the tabs
            await openTestPage(page, config.dash.urls.DashboardWithTabsAndSelectors);
            await dashboardPage.duplicateDashboard({
                dashId: config.dash.urls.DashboardWithTabsAndSelectors,
                useUserFolder: true,
            });

            await dashboardPage.changeTab({tabName: PARAMS.OLD_SELECTOR_TAB});
            await dashboardPage.enterEditMode();

            await dashboardPage.copyFirstWidget();

            await dashboardPage.controlActions.clickAddSelector();
            await dashboardPage.controlActions.editSelectorBySettings(PARAMS.MANUAL_CONTROL);

            await page.locator(slct(TabMenuQA.Paste)).click();

            const itemsCount = await page.locator(slct(TabMenuQA.Item)).count();

            expect(itemsCount).toEqual(2);

            await dashboardPage.controlActions.applyControlSettings();

            await dashboardPage.saveChanges();

            const selectorsLabelsCount = (await dashboardPage.getGroupSelectorLabels()).length;

            expect(selectorsLabelsCount).toEqual(3);
        },
    );

    datalensTest(
        'Group of selector can be copied from the dash and inserted into a group of selectors',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup([
                        PARAMS.MANUAL_CONTROL,
                        PARAMS.MANUAL_SECOND_CONTROL,
                    ]);
                },
                waitingRequestOptions: {
                    controlTitles: [
                        PARAMS.MANUAL_CONTROL.appearance.title,
                        PARAMS.MANUAL_SECOND_CONTROL.appearance.title,
                    ],
                },
            });

            await dashboardPage.enterEditMode();
            await dashboardPage.copyFirstWidget();

            await dashboardPage.addTab(PARAMS.ADDITIONAL_TAB);
            await dashboardPage.changeTab({tabName: PARAMS.ADDITIONAL_TAB});

            await dashboardPage.controlActions.clickAddSelector();
            await dashboardPage.controlActions.editSelectorBySettings(PARAMS.MANUAL_THIRD_CONTROL);

            await page.locator(slct(TabMenuQA.Paste)).click();

            const itemsCount = await page.locator(slct(TabMenuQA.Item)).count();

            expect(itemsCount).toEqual(3);

            await dashboardPage.controlActions.dialogControl.checkCurrentValues(
                PARAMS.MANUAL_CONTROL,
            );

            await page.locator(slct(TabMenuQA.Item)).nth(2).click();

            await dashboardPage.controlActions.dialogControl.checkCurrentValues(
                PARAMS.MANUAL_SECOND_CONTROL,
            );

            await dashboardPage.controlActions.applyControlSettings();
            await dashboardPage.saveChanges();

            const selectorsLabels = await dashboardPage.getGroupSelectorLabels();

            // required field add * to title
            expect(selectorsLabels).toEqual([
                PARAMS.MANUAL_THIRD_CONTROL.appearance.title,
                `${PARAMS.MANUAL_CONTROL.appearance.title}*`,
                PARAMS.MANUAL_SECOND_CONTROL.appearance.title,
            ]);
        },
    );
});
