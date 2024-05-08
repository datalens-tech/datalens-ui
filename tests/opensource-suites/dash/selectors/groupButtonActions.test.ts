import {Page} from '@playwright/test';

import {ControlQA, DialogGroupControlQa, Feature} from '../../../../src/shared';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {getUrlStateParam} from '../../../suites/dash/helpers';
import {isEnabledFeature, openTestPage, slct} from '../../../utils';

const PARAMS = {
    FIRST_CONTROL: {
        controlTitle: 'test-control',
        controlItems: ['91000', '98800'],
        controlFieldName: 'test-control-field',
        defaultValue: '98800',
    },
    SECOND_CONTROL: {
        controlTitle: 'test-control-2',
        controlItems: ['1', '2'],
        controlFieldName: 'test-control-field-2',
        defaultValue: '2',
    },
};

const STATE_CHANGING_TIMEOUT = 1000;

const getNewStateHash = async (page: Page, action: () => Promise<void>) => {
    const requestPromise = page.waitForRequest('/gateway/root/us/createDashState');
    await action();
    const finishedPromise = await requestPromise;

    // check new state
    const responseState = await finishedPromise.response();
    const jsonState = await responseState?.json();

    return jsonState?.hash;
};

datalensTest.describe('Dashboards - Action buttons in group selectors', () => {
    let skipAfterEach = false;

    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        // some page need to be loaded so we can get data of feature flag from DL var
        await openTestPage(page, '/');

        const isEnabledGroupControls = await isEnabledFeature(page, Feature.GroupControls);

        if (!isEnabledGroupControls) {
            skipAfterEach = true;
            datalensTest.skip();
        }
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addSelectorsGroup([
                    PARAMS.FIRST_CONTROL,
                    PARAMS.SECOND_CONTROL,
                ]);
            },
        });

        await dashboardPage.clickFirstControlSettingsButton();
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        if (skipAfterEach) {
            return;
        }

        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash();
    });

    datalensTest(
        '`Apply` button of the group selector applies the selected values',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await page.locator(slct(DialogGroupControlQa.applyButtonCheckbox)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();
            await dashboardPage.clickSaveButton(true);

            // check that there's no state
            expect(getUrlStateParam(page)).toEqual(null);

            const applyButton = await dashboardPage.waitForSelector(
                slct(ControlQA.controlButtonApply),
            );
            await applyButton.click();

            // timeout so state has time to be wrote in search params
            await page.waitForTimeout(STATE_CHANGING_TIMEOUT);
            // default params are equal to initial in dashkit so state doesn't change
            expect(getUrlStateParam(page)).toEqual(null);

            await dashboardPage.setSelectWithTitle(
                {title: PARAMS.FIRST_CONTROL.controlTitle},
                PARAMS.FIRST_CONTROL.controlItems[0],
            );

            // timeout so state has time to be wrote in search params
            await page.waitForTimeout(STATE_CHANGING_TIMEOUT);
            // check that there's no state (apply button isn't pressed after changing value)
            expect(getUrlStateParam(page)).toEqual(null);

            const requestPromise = page.waitForRequest('/gateway/root/us/createDashState');
            await applyButton.click();
            const finishedRequest = await requestPromise;

            // check state queue to have both selector params
            expect(finishedRequest.postDataJSON().data.__meta__.queue.length).toEqual(2);
            // check new state
            const responseState = await finishedRequest.response();
            const jsonState = await responseState?.json();

            expect(jsonState?.hash).toBeTruthy();
        },
    );

    datalensTest(
        'The single `Reset` button of the group selector resets the values to default and applies the values',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await page.locator(slct(DialogGroupControlQa.resetButtonCheckbox)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();
            await dashboardPage.clickSaveButton(true);

            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.FIRST_CONTROL.controlTitle,
                value: PARAMS.FIRST_CONTROL.defaultValue,
            });
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.SECOND_CONTROL.controlTitle,
                value: PARAMS.SECOND_CONTROL.defaultValue,
            });

            // first reset write to state current selectors values (in our case, defaults)
            const resetButton = await dashboardPage.waitForSelector(
                slct(ControlQA.controlButtonReset),
            );

            // save state with defaults
            const defaultState = await getNewStateHash(page, async () => {
                await resetButton.click();
            });
            expect(defaultState).toBeTruthy();

            const changedState = await getNewStateHash(page, async () => {
                await dashboardPage.setSelectWithTitle(
                    {title: PARAMS.FIRST_CONTROL.controlTitle},
                    PARAMS.FIRST_CONTROL.controlItems[0],
                );
                await dashboardPage.setSelectWithTitle(
                    {title: PARAMS.SECOND_CONTROL.controlTitle},
                    PARAMS.SECOND_CONTROL.controlItems[0],
                );
            });

            expect(changedState).toBeTruthy();

            expect(defaultState).not.toEqual(changedState);

            const resetState = await getNewStateHash(page, async () => {
                await resetButton.click();
            });

            expect(resetState).toEqual(defaultState);

            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.FIRST_CONTROL.controlTitle,
                value: PARAMS.FIRST_CONTROL.defaultValue,
            });
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.SECOND_CONTROL.controlTitle,
                value: PARAMS.SECOND_CONTROL.defaultValue,
            });
        },
    );

    datalensTest(
        "The `Reset` button of the group selector resets the values to default and doesn't apply the values if `Apply` button is enabled",
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await page.locator(slct(DialogGroupControlQa.applyButtonCheckbox)).click();
            await page.locator(slct(DialogGroupControlQa.resetButtonCheckbox)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();
            await dashboardPage.clickSaveButton(true);

            // check that there's no state
            expect(getUrlStateParam(page)).toEqual(null);

            // check default values in selectors
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.FIRST_CONTROL.controlTitle,
                value: PARAMS.FIRST_CONTROL.defaultValue,
            });
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.SECOND_CONTROL.controlTitle,
                value: PARAMS.SECOND_CONTROL.defaultValue,
            });

            // change values
            await dashboardPage.setSelectWithTitle(
                {title: PARAMS.FIRST_CONTROL.controlTitle},
                PARAMS.FIRST_CONTROL.controlItems[0],
            );
            await dashboardPage.setSelectWithTitle(
                {title: PARAMS.SECOND_CONTROL.controlTitle},
                PARAMS.SECOND_CONTROL.controlItems[0],
            );

            await page.waitForTimeout(STATE_CHANGING_TIMEOUT);
            // check that there's still no state (to change it necessary to click Apply)
            expect(getUrlStateParam(page)).toEqual(null);

            const applyButton = await dashboardPage.waitForSelector(
                slct(ControlQA.controlButtonApply),
            );
            const nonDefaultState = await getNewStateHash(page, async () => {
                // apply no defaults values
                await applyButton.click();
            });
            expect(nonDefaultState).not.toEqual(null);

            const resetButton = await dashboardPage.waitForSelector(
                slct(ControlQA.controlButtonReset),
            );
            // reset values to defaults
            await resetButton.click();

            // timeout so state has time to be wrote in search params
            await page.waitForTimeout(STATE_CHANGING_TIMEOUT);
            // state should not change because the apply button is not clicked
            expect(getUrlStateParam(page)).toEqual(nonDefaultState);

            // check that state with defaults is different from non-default state
            const defaultState = await getNewStateHash(page, async () => {
                // apply values to create state
                await applyButton.click();
            });
            expect(defaultState).not.toEqual(nonDefaultState);

            // check that values in selectors are defaults now
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.FIRST_CONTROL.controlTitle,
                value: PARAMS.FIRST_CONTROL.defaultValue,
            });
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.SECOND_CONTROL.controlTitle,
                value: PARAMS.SECOND_CONTROL.defaultValue,
            });
        },
    );
});
