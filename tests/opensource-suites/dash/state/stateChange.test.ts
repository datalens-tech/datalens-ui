import {Page, Response, expect} from '@playwright/test';

import {clickSelectOption, openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {TestParametrizationConfig} from '../../../types/config';
import {getUrlStateParam} from '../../../suites/dash/helpers';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {ChartkitMenuDialogsQA, ControlQA, ControlType, WizardType} from '../../../../src/shared';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';

const SELECTORS = {
    TAB_SELECTOR_TEXT: '.yc-select-control__tokens-text',
    EMPTY_SELECTOR_VAL: '.yc-select-control__tokens-text_empty',
};
const PARAMS = {
    TAB_1_SELECT_VALUE_1: 'Abilene',
    TAB_1_SELECT_VALUE_2: 'Aberdeen',
    TAB_2_SELECT_VALUE_1: 'Allen',
    TAB_4_SELECT_VALUE_1: 'Akron',
    EMPTY_SELECTOR_VAL_TEXT: '—',
    TAB_1_NAME: 'Tab 1',
    TAB_2_NAME: 'Tab 2',
    TAB_4_NAME: 'Tab 4',
};
const TIMEOUT = 4000;

const getStateFromResponse = async (response: Promise<Response>) => {
    const receivedResponse = await response;
    const jsonResponse = await receivedResponse.json();
    return jsonResponse.hash;
};

const selectOptionAndGetState = async ({
    page,
    selector,
    value,
}: {
    page: Page;
    selector: string;
    value: string;
}) => {
    const stateChangeResponse = page.waitForResponse(CommonUrls.CreateDashState);
    await Promise.all([page.waitForNavigation(), clickSelectOption(page, selector, value)]);
    const stateFromRequest = await getStateFromResponse(stateChangeResponse);

    const stateParam = getUrlStateParam(page);
    expect(stateParam).toEqual(stateFromRequest);
    return stateFromRequest;
};

const waitBackGetUrlStateParam = async (page: Page): Promise<string | null> => {
    await Promise.all([page.waitForNavigation(), page.goBack()]);
    await page.waitForTimeout(TIMEOUT);
    return getUrlStateParam(page);
};

const waitForWidgetsRunAndGetChartResponse = async (
    page: Page,
    action?: () => Promise<void>,
): Promise<Response | undefined> => {
    let chartResponseData;
    const chartResponse = page.waitForResponse(async (response: Response) => {
        if (response.url().includes(CommonUrls.ApiRun)) {
            expect(response.status()).toEqual(200);
            const jsonResponse = await response.json();
            if (
                jsonResponse.type === WizardType.GraphWizardNode ||
                jsonResponse.type === WizardType.GravityChartsWizardNode
            ) {
                chartResponseData = response;
                return true;
            }
        }
        return false;
    });
    const controlResponse = page.waitForResponse(async (response: Response) => {
        if (response.url().includes(CommonUrls.ApiRun)) {
            expect(response.status()).toEqual(200);
            const jsonResponse = await response.json();
            if (jsonResponse.type === ControlType.Dash) {
                return true;
            }
        }
        return false;
    });

    await action?.();

    await Promise.all([chartResponse, controlResponse]);

    return chartResponseData;
};

const checkChartWithValuesAndGetResponse = async ({
    page,
    rightValues,
    wrongValues,
    action,
}: {
    page: Page;
    rightValues: string[];
    wrongValues?: string[];
    action?: () => Promise<void>;
}) => {
    // Wait for load of chart and selector
    const chartResponseData = await waitForWidgetsRunAndGetChartResponse(page, action);

    const graph = page
        .locator(`${slct(ChartkitMenuDialogsQA.chartWidget)} svg:first-child`)
        .first();
    await expect(graph).toBeVisible();

    // Check that the chart has been drawn with the applied values of the selector parameters based on the dataset
    for (const rightValue of rightValues) {
        const chartWidgetWithRightValue = page
            .locator(`${slct(ChartkitMenuDialogsQA.chartWidget)} >> text=${rightValue}`)
            .first();
        await expect(chartWidgetWithRightValue).toBeAttached();
    }

    if (wrongValues) {
        for (const wrongValue of wrongValues) {
            const chartWidgetWithRightValue = page
                .locator(`${slct(ChartkitMenuDialogsQA.chartWidget)} >> text=${wrongValue}`)
                .first();
            await expect(chartWidgetWithRightValue).toBeHidden();
        }
    }

    return chartResponseData;
};

datalensTest.describe('Dashboards - States with tabs', () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            // waiting for api/run for selector and chart
            await waitForWidgetsRunAndGetChartResponse(page, async () => {
                await openTestPage(page, config.dash.urls.DashboardWithTabsAndSelectors);
            });
        },
    );

    datalensTest(
        'Checking that the state parameter was added when the selector was changed and reset when switching to another tab',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            // Check that the state parameter has been updated
            await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_1_SELECT_VALUE_1,
            });

            // Click on another tab
            await dashboardPage.changeTab({tabName: PARAMS.TAB_2_NAME});

            // Waiting for rendering on the second tab
            await page.waitForSelector(`${slct(ControlQA.controlSelect)}`);

            // Check that the state parameter has been reset
            expect(getUrlStateParam(page)).toEqual(null);
        },
    );

    datalensTest(
        'Checking that the state changes correctly and resets when switching between tabs using the browser\'s "Back" button',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            // Check that the state parameter has been updated
            const firstTabState = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_1_SELECT_VALUE_1,
            });

            // Click on another tab
            await dashboardPage.changeTab({tabName: PARAMS.TAB_2_NAME});

            // Waiting for rendering on the second tab
            await page.waitForSelector(slct(ControlQA.controlSelect));

            // Check that the state parameter has been reset
            expect(getUrlStateParam(page)).toEqual(null);

            // Click on the fourth tab and wait for the page url to change
            const urlParam = await dashboardPage.changeTabAndGetState({
                tabName: PARAMS.TAB_4_NAME,
                timeout: TIMEOUT,
            });
            // Check that the state parameter has been reset
            expect(urlParam).toEqual(null);

            // Select the value of the external selector on the fourth tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            const fourthTabState = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_4_SELECT_VALUE_1,
            });
            // Check that the state parameter was updated when the external selector was changed
            expect(fourthTabState).not.toEqual(firstTabState);

            // Click on the native browser button "Back" and wait for the reset of the state
            await page.goBack();
            expect(getUrlStateParam(page)).toEqual(null);

            // Click on the native browser button "Back" and wait for the transition to the second tab that did not have a state
            await page.goBack();
            await page.waitForSelector(slct(ControlQA.controlSelect));
            expect(getUrlStateParam(page)).toEqual(null);

            // Click on the native browser button "Back" and wait for the transition to the first tab that has a state
            await waitForWidgetsRunAndGetChartResponse(page, async () => {
                await page.goBack();
            });
            expect(getUrlStateParam(page)).toEqual(firstTabState);

            // Click on the native browser button "Forward" and wait for the transition to the second tab that did not have a state
            await page.goForward();
            await page.waitForSelector(slct(ControlQA.controlSelect));
            expect(getUrlStateParam(page)).toEqual(null);

            // Double-click on the native browser button "Forward" and wait for the transition to the fourth tab with the restored state
            await page.goForward();
            await page.goForward();
            await page.waitForSelector(slct(ControlQA.controlSelect, PARAMS.TAB_4_SELECT_VALUE_1));
            expect(getUrlStateParam(page)).toEqual(fourthTabState);
        },
    );

    datalensTest(
        'Checking whether the state parameter is saved when changing different types of selectors and when switching to another tab and back',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            // Check that the state parameter has been updated
            const firstTabState = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_1_SELECT_VALUE_1,
            });

            // Select another selector value on the first tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            const firstTabStateAfterUpdate = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_1_SELECT_VALUE_2,
            });
            // Check that the state parameter has changed after a new selection in the selector based on the dataset
            expect(firstTabStateAfterUpdate).not.toEqual(firstTabState);

            // Click on the second tab and wait for the update in the url
            let urlParam = await dashboardPage.changeTabAndGetState({
                tabName: PARAMS.TAB_2_NAME,
                timeout: TIMEOUT,
            });
            // Check that the state parameter was reset when switching to the second tab
            expect(urlParam).toEqual(null);

            // Click on the first tab and wait for the page url to change
            await checkChartWithValuesAndGetResponse({
                page,
                rightValues: [PARAMS.TAB_1_SELECT_VALUE_2],
                wrongValues: [PARAMS.TAB_1_SELECT_VALUE_1],
                action: async () => {
                    const changedUrl = await dashboardPage.changeTabAndGetState({
                        tabName: PARAMS.TAB_1_NAME,
                        timeout: TIMEOUT,
                    });
                    // Check that the state parameter has been preserved after returning to the previous tab
                    expect(changedUrl).toEqual(firstTabStateAfterUpdate);
                },
            });

            // Click on the fourth tab and wait for the page url to change
            urlParam = await dashboardPage.changeTabAndGetState({
                tabName: PARAMS.TAB_4_NAME,
                timeout: TIMEOUT,
            });
            // Check that the state parameter has been reset
            expect(urlParam).toEqual(null);

            // Select the value of the external selector on the fourth tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            const fourthTabState = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_4_SELECT_VALUE_1,
            });
            // Check that the state parameter was updated when the external selector was changed
            expect(fourthTabState).not.toEqual(firstTabStateAfterUpdate);

            // Click on the second tab and wait for the update in the url
            urlParam = await dashboardPage.changeTabAndGetState({
                tabName: PARAMS.TAB_2_NAME,
                timeout: TIMEOUT,
            });
            // Check that the state parameter has been reset
            expect(urlParam).toEqual(null);

            // Select the value of the manual selector on the second tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            const secondTabState = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_2_SELECT_VALUE_1,
            });
            // Check that the state parameter has been updated after selecting the value of the manual selector
            expect(secondTabState).not.toEqual(fourthTabState);

            // Click on the fourth tab and wait for the page url to change
            urlParam = await dashboardPage.changeTabAndGetState({
                tabName: PARAMS.TAB_4_NAME,
                timeout: TIMEOUT,
            });
            // Check that the state parameter has been restored
            expect(urlParam).toEqual(fourthTabState);

            // Click on the second tab and wait for the page url to change
            urlParam = await dashboardPage.changeTabAndGetState({
                tabName: PARAMS.TAB_2_NAME,
                timeout: TIMEOUT,
            });
            // Check that the state parameter has been restored
            expect(urlParam).toEqual(secondTabState);
        },
    );

    datalensTest(
        'Checking backward transitions in the browser and consistency of the state parameter when changing different types of selectors and when switching to another tab',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            // Check that the state parameter has been updated
            const firstTabState = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_1_SELECT_VALUE_1,
            });

            // Select another selector value on the first tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            const firstTabStateUpdated = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_1_SELECT_VALUE_2,
            });

            expect(firstTabStateUpdated).not.toEqual(firstTabState);

            await checkChartWithValuesAndGetResponse({
                page,
                rightValues: [PARAMS.TAB_1_SELECT_VALUE_1],
                wrongValues: [PARAMS.TAB_1_SELECT_VALUE_2],
                action: async () => {
                    // We return to the browser by clicking the back button
                    const urlParam = await waitBackGetUrlStateParam(page);

                    // Check that when switching back, the state parameter returned to the state of the first selected
                    expect(urlParam).toEqual(firstTabState);
                },
            });

            // Click on the second tab and wait for the update in the url
            await dashboardPage.changeTabAndGetState({
                tabName: PARAMS.TAB_2_NAME,
                timeout: TIMEOUT,
            });

            // Select the value of the manual selector on the second tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            const secondTabState = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_2_SELECT_VALUE_1,
            });
            // Check that the state parameter has been updated after selecting the value of the manual selector
            expect(secondTabState).not.toEqual(firstTabState);

            // Click on the fourth tab and wait for the page url to change
            let urlParam = await dashboardPage.changeTabAndGetState({
                tabName: PARAMS.TAB_4_NAME,
                timeout: TIMEOUT,
            });
            // Check that the state parameter has been reset
            expect(urlParam).toEqual(null);

            // Select the value of the external selector on the fourth tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            const fourthTabState = await selectOptionAndGetState({
                page,
                selector: ControlQA.controlSelect,
                value: PARAMS.TAB_4_SELECT_VALUE_1,
            });
            // Check that the state parameter was updated when the external selector was changed
            expect(fourthTabState).not.toEqual(secondTabState);

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the state parameter returned to the state of the not selected selector on the third tab
            expect(urlParam).toEqual(null);

            let selector = await page.$(
                `${slct(ControlQA.controlSelect)} >> ${SELECTORS.TAB_SELECTOR_TEXT}`,
            );
            let selectorText = await selector?.innerText();
            // Check that the selector value has been reset when switching back
            expect(selectorText).toEqual(PARAMS.EMPTY_SELECTOR_VAL_TEXT);

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the state parameter returned to the state of the selector on the second tab
            expect(urlParam).toEqual(secondTabState);

            selector = await page.$(
                `${slct(ControlQA.controlSelect)} >> ${SELECTORS.TAB_SELECTOR_TEXT}`,
            );
            selectorText = await selector?.innerText();
            // Check that when switching back, the selector value has returned to the state on the second tab
            expect(selectorText).toEqual(PARAMS.TAB_2_SELECT_VALUE_1);

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the state parameter returned to the state of the not selected selector on the second tab
            expect(urlParam).toEqual(null);

            selector = await page.$(
                `${slct(ControlQA.controlSelect)} >> ${SELECTORS.TAB_SELECTOR_TEXT}`,
            );
            selectorText = await selector?.innerText();
            // Check that when switching back, the selector value has returned to the state on the second tab
            const defaultValue = await page.$(`${SELECTORS.EMPTY_SELECTOR_VAL}`);
            const defaultValueText = await defaultValue?.innerText();

            expect(selectorText).toEqual(defaultValueText);

            await checkChartWithValuesAndGetResponse({
                page,
                rightValues: [PARAMS.TAB_1_SELECT_VALUE_1],
                wrongValues: [PARAMS.TAB_1_SELECT_VALUE_2],
                action: async () => {
                    // We return to the browser by clicking the back button
                    const urlAfterBack = await waitBackGetUrlStateParam(page);
                    // Check that when switching back, the state parameter returned to the state of the first selected
                    expect(urlAfterBack).toEqual(firstTabState);
                },
            });

            const chartResponse = await checkChartWithValuesAndGetResponse({
                page,
                rightValues: [PARAMS.TAB_1_SELECT_VALUE_2],
                action: async () => {
                    // We return to the browser by clicking the back button
                    const urlAfterBack = await waitBackGetUrlStateParam(page);
                    // Check that when switching back, the selector value has returned to the unselected state on the first tab
                    expect(urlAfterBack).toEqual(null);
                },
            });

            // сhart must have one empty param
            if (chartResponse) {
                const requestDataParams = chartResponse.request().postDataJSON().params;
                expect(Object.values(requestDataParams)[0]).toBeFalsy();
            }
        },
    );
});
