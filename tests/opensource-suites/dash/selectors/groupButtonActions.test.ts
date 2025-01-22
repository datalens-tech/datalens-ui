import {Page, Request} from '@playwright/test';

import {ControlQA, DialogGroupControlQa, UPDATE_STATE_DEBOUNCE_TIME} from '../../../../src/shared';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {getUrlStateParam} from '../../../suites/dash/helpers';
import {slct} from '../../../utils';
import {CommonUrls} from '../../../page-objects/constants/common-urls';

const PARAMS = {
    FIRST_CONTROL: {
        appearance: {title: 'test-control'},
        items: ['91000', '98800', '90000'],
        fieldName: 'test-control-field',
        defaultValue: '98800',
    },
    SECOND_CONTROL: {
        appearance: {title: 'test-control-2'},
        items: ['1', '2', '3'],
        fieldName: 'test-control-field-2',
        defaultValue: '2',
    },
};

const STATE_CHANGING_TIMEOUT = 1000;

datalensTest.describe('Dashboards - Action buttons in group selectors', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.controlActions.addSelectorsGroup([
                    PARAMS.FIRST_CONTROL,
                    PARAMS.SECOND_CONTROL,
                ]);
            },
        });

        await dashboardPage.enterEditMode();
        await dashboardPage.clickFirstControlSettingsButton();
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash();
    });

    datalensTest(
        '`Apply` button of the group selector applies the selected values',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await page.locator(slct(DialogGroupControlQa.extendedSettingsButton)).click();
            await page.locator(slct(DialogGroupControlQa.applyButtonCheckbox)).click();
            await page.locator(slct(DialogGroupControlQa.extendedSettingsApplyButton)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();
            await dashboardPage.saveChanges();

            // check that there's no state
            expect(getUrlStateParam(page)).toEqual(null);

            const applyButton = await dashboardPage.waitForSelector(
                slct(ControlQA.controlButtonApply),
            );
            await applyButton.click();

            // timeout so state has time to be written  in search params
            await page.waitForTimeout(STATE_CHANGING_TIMEOUT);
            // default params are equal to initial in dashkit so state doesn't change
            expect(getUrlStateParam(page)).toEqual(null);

            await dashboardPage.setSelectWithTitle(
                {title: PARAMS.FIRST_CONTROL.appearance.title},
                PARAMS.FIRST_CONTROL.items[0],
            );

            // timeout so state has time to be written  in search params
            await page.waitForTimeout(STATE_CHANGING_TIMEOUT);
            // check that there's no state (apply button isn't pressed after changing value)
            expect(getUrlStateParam(page)).toEqual(null);

            const requestPromise = page.waitForRequest(CommonUrls.CreateDashState);
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

            await page.locator(slct(DialogGroupControlQa.extendedSettingsButton)).click();
            await page.locator(slct(DialogGroupControlQa.resetButtonCheckbox)).click();
            await page.locator(slct(DialogGroupControlQa.extendedSettingsApplyButton)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();
            await dashboardPage.saveChanges();

            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.FIRST_CONTROL.appearance.title,
                value: PARAMS.FIRST_CONTROL.defaultValue,
            });
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.SECOND_CONTROL.appearance.title,
                value: PARAMS.SECOND_CONTROL.defaultValue,
            });

            // first reset write to state current selectors values (in our case, defaults)
            const resetButton = await dashboardPage.waitForSelector(
                slct(ControlQA.controlButtonReset),
            );

            // save state with defaults
            const defaultState = await dashboardPage.getNewStateHashAfterAction(async () => {
                await resetButton.click();
            });
            expect(defaultState).toBeTruthy();

            const changedState = await dashboardPage.getNewStateHashAfterAction(async () => {
                await dashboardPage.setSelectWithTitle(
                    {title: PARAMS.FIRST_CONTROL.appearance.title},
                    PARAMS.FIRST_CONTROL.items[0],
                );
                await dashboardPage.setSelectWithTitle(
                    {title: PARAMS.SECOND_CONTROL.appearance.title},
                    PARAMS.SECOND_CONTROL.items[0],
                );
            });

            expect(changedState).toBeTruthy();

            expect(defaultState).not.toEqual(changedState);

            const resetState = await dashboardPage.getNewStateHashAfterAction(async () => {
                await resetButton.click();
            });

            expect(resetState).toEqual(defaultState);

            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.FIRST_CONTROL.appearance.title,
                value: PARAMS.FIRST_CONTROL.defaultValue,
            });
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.SECOND_CONTROL.appearance.title,
                value: PARAMS.SECOND_CONTROL.defaultValue,
            });
        },
    );

    datalensTest(
        "The `Reset` button of the group selector resets the values to default and doesn't apply the values if `Apply` button is enabled",
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            let stateUpdatesCount = 0;

            await page.locator(slct(DialogGroupControlQa.extendedSettingsButton)).click();
            await page.locator(slct(DialogGroupControlQa.applyButtonCheckbox)).click();
            await page.locator(slct(DialogGroupControlQa.resetButtonCheckbox)).click();
            await page.locator(slct(DialogGroupControlQa.extendedSettingsApplyButton)).click();

            await page.locator(slct(ControlQA.dialogControlApplyBtn)).click();
            await dashboardPage.saveChanges();

            // check default values in selectors
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.FIRST_CONTROL.appearance.title,
                value: PARAMS.FIRST_CONTROL.defaultValue,
            });
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.SECOND_CONTROL.appearance.title,
                value: PARAMS.SECOND_CONTROL.defaultValue,
            });

            // counting state change calls
            const stateChangeListener = (request: Request) => {
                if (request.url().endsWith(CommonUrls.PartialCreateDashState)) {
                    stateUpdatesCount++;
                }
            };

            page.on('request', stateChangeListener);

            // change values
            await dashboardPage.setSelectWithTitle(
                {title: PARAMS.FIRST_CONTROL.appearance.title},
                PARAMS.FIRST_CONTROL.items[0],
            );
            await dashboardPage.setSelectWithTitle(
                {title: PARAMS.SECOND_CONTROL.appearance.title},
                PARAMS.SECOND_CONTROL.items[0],
            );

            // there should be NO state changes after value selecting (to change it, you need to click "Apply")

            // wait for debounce timeout to detect the extra request
            await page.waitForTimeout(UPDATE_STATE_DEBOUNCE_TIME);

            const applyButton = await dashboardPage.waitForSelector(
                slct(ControlQA.controlButtonApply),
            );

            const nonDefaultState = await dashboardPage.getNewStateHashAfterAction(async () => {
                // apply no defaults values
                await applyButton.click();
            });

            expect(nonDefaultState).not.toEqual(null);

            const resetButton = await dashboardPage.waitForSelector(
                slct(ControlQA.controlButtonReset),
            );
            // reset values to defaults
            await resetButton.click();

            // there should be NO state changes after click reset (to change it, you need to click "Apply")

            // check that values in selectors are defaults now
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.FIRST_CONTROL.appearance.title,
                value: PARAMS.FIRST_CONTROL.defaultValue,
            });
            await dashboardPage.checkSelectValueByTitle({
                title: PARAMS.SECOND_CONTROL.appearance.title,
                value: PARAMS.SECOND_CONTROL.defaultValue,
            });

            await dashboardPage.setSelectWithTitle(
                {title: PARAMS.FIRST_CONTROL.appearance.title},
                PARAMS.FIRST_CONTROL.items[2],
            );
            await dashboardPage.setSelectWithTitle(
                {title: PARAMS.SECOND_CONTROL.appearance.title},
                PARAMS.SECOND_CONTROL.items[2],
            );

            // wait for debounce timeout to detect the extra request
            await page.waitForTimeout(UPDATE_STATE_DEBOUNCE_TIME);

            // check that state with new values is different from old state
            const defaultState = await dashboardPage.getNewStateHashAfterAction(async () => {
                // apply values to create state
                await applyButton.click();
            });
            expect(defaultState).not.toEqual(nonDefaultState);

            // apply button is pressed twice during the test, so there should be two changes
            // if there are more than 2 changes, it means that an unnecessary change occurred
            // (during the change of values or pressing Reset button)
            expect(stateUpdatesCount).toEqual(2);

            page.off('request', stateChangeListener);
        },
    );
});
