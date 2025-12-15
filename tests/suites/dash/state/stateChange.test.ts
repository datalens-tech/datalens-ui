import {Page} from '@playwright/test';

import {clickSelectOption, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {getUrlStateParam} from '../helpers';

const SELECTORS = {
    TAB_ITEM_LINK: '.dl-tabs__tab',
    TAB_SELECTOR_KEY: 'chartkit-control-select',
    TAB_SELECTOR_TEXT: '.yc-select-control__tokens-text',
    CHART_KEY: 'chartkit-body-entry-vevhev23wodko',
    CHART_BODY_PATH:
        '.chartkit-highcharts rect.highcharts-point, .gcharts-chart .gcharts-bar-x__segment',
    EMPTY_SELECTOR_VAL: '.yc-select-control__tokens-text_empty',
};
const PARAMS = {
    TAB_1_SELECT_VALUE_1: '1970-01-02',
    TAB_1_SELECT_VALUE_2: '1970-01-03',
    TAB_1_STATE_HASH_1: '74ae9b28112',
    TAB_1_STATE_HASH_2: '65ef9c16125',
    TAB_2_SELECT_VALUE_1: 'val 1',
    TAB_2_STATE_HASH_1: '216a9a0e99',
    TAB_3_SELECT_VALUE_DEFAULT: 'Day',
    TAB_3_SELECT_VALUE_1: 'Week',
    TAB_3_STATE_HASH_1: '43f7c7ca108',
};
const TIMEOUT = 4000;

const waitClickTabGetUrlStateParam = async ({
    page,
    tabText,
}: {
    page: Page;
    tabText: string;
}): Promise<string | null> => {
    await Promise.all([
        page.waitForNavigation(),
        page.click(`${SELECTORS.TAB_ITEM_LINK} >> text="${tabText}"`),
    ]);
    await page.waitForTimeout(TIMEOUT);

    const stateParam = getUrlStateParam(page);
    return new Promise((resolve) => resolve(stateParam));
};

const waitSelectOptionGetUrlStateParam = async ({
    page,
    selector,
    value,
}: {
    page: Page;
    selector: string;
    value: string;
}): Promise<string | null> => {
    await Promise.all([page.waitForNavigation(), clickSelectOption(page, selector, value)]);
    const stateParam = getUrlStateParam(page);
    return new Promise((resolve) => resolve(stateParam));
};

const waitClickElemGetUrlStateParam = async ({
    page,
    selector,
}: {
    page: Page;
    selector: string;
}): Promise<string | null> => {
    await Promise.all([page.waitForNavigation(), page.click(selector)]);
    const stateParam = getUrlStateParam(page);
    return new Promise((resolve) => resolve(stateParam));
};

const waitBackGetUrlStateParam = async (page: Page): Promise<string | null> => {
    await Promise.all([page.waitForNavigation(), page.goBack()]);
    await page.waitForTimeout(TIMEOUT);
    const stateParam = getUrlStateParam(page);
    return new Promise((resolve) => resolve(stateParam));
};

datalensTest.describe('Dashboards - States with tabs', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTabsAndSelectors);

        // We are waiting for the drawing of the chart on the first tab and the passage of all initial requests for rendering, respectively
        await page.waitForSelector(`${slct(SELECTORS.CHART_KEY)}`);

        // Select the selector value based on the dataset on the first tab and
        // waiting for the deferred request to create a state and add it to the url to pass
        await Promise.all([
            page.waitForNavigation(),
            clickSelectOption(page, SELECTORS.TAB_SELECTOR_KEY, PARAMS.TAB_1_SELECT_VALUE_1),
        ]);
    });

    datalensTest(
        'Checking that the state parameter was added when the selector was changed and reset when switching to another tab',
        async ({page}: {page: Page}) => {
            let pageURL = new URL(page.url());
            // Check that the state parameter has been updated
            expect(pageURL.searchParams.get('state')).toEqual(PARAMS.TAB_1_STATE_HASH_1);

            // Click on another tab
            await page.click(`${SELECTORS.TAB_ITEM_LINK} >> text="Tab 2"`);

            // Waiting for rendering on the second tab
            await page.waitForSelector(`${slct(SELECTORS.TAB_SELECTOR_KEY)}`);

            pageURL = new URL(page.url());
            // Check that the state parameter has been reset
            expect(pageURL.searchParams.get('state')).toEqual(null);
        },
    );

    datalensTest(
        'Checking that the state changes correctly and resets when switching between tabs using the browser\'s "Back" button',
        async ({page}: {page: Page}) => {
            let pageURL = new URL(page.url());
            // Check that the state parameter has been updated
            expect(pageURL.searchParams.get('state')).toEqual(PARAMS.TAB_1_STATE_HASH_1);

            // Click on another tab
            await page.click(`${SELECTORS.TAB_ITEM_LINK} >> text="Tab 2"`);

            // Waiting for rendering on the second tab
            await page.waitForSelector(slct(SELECTORS.TAB_SELECTOR_KEY));

            pageURL = new URL(page.url());
            // Check that the state parameter has been reset
            expect(pageURL.searchParams.get('state')).toEqual(null);

            // Click on the third tab and wait for the page url to change
            let urlParam = await waitClickTabGetUrlStateParam({page, tabText: 'Tab 3'});
            // Check that the state parameter has been reset
            expect(urlParam).toEqual(null);

            // Select the value of the external selector on the third tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            urlParam = await waitSelectOptionGetUrlStateParam({
                page,
                selector: SELECTORS.TAB_SELECTOR_KEY,
                value: PARAMS.TAB_3_SELECT_VALUE_1,
            });
            // Check that the state parameter was updated when the external selector was changed
            expect(urlParam).toEqual(PARAMS.TAB_3_STATE_HASH_1);

            // Click on the native browser button "Back" and wait for the reset of the state
            await page.goBack();
            expect(getUrlStateParam(page)).toEqual(null);

            // Click on the native browser button "Back" and wait for the transition to the second tab that did not have a state
            await page.goBack();
            await page.waitForSelector(slct(SELECTORS.TAB_SELECTOR_KEY));
            expect(getUrlStateParam(page)).toEqual(null);

            // Click on the native browser button "Back" and wait for the transition to the first tab that has a state
            await page.goBack();
            await page.waitForSelector(slct(SELECTORS.CHART_KEY));
            expect(getUrlStateParam(page)).toEqual(PARAMS.TAB_1_STATE_HASH_1);

            // Click on the native browser button "Forward" and wait for the transition to the second tab that did not have a state
            await page.goForward();
            await page.waitForSelector(slct(SELECTORS.TAB_SELECTOR_KEY));
            expect(getUrlStateParam(page)).toEqual(null);

            // Double-click on the native browser button "Forward" and wait for the transition to the third tab with the restored state
            await page.goForward();
            await page.goForward();
            await page.waitForSelector(
                slct(SELECTORS.TAB_SELECTOR_KEY, PARAMS.TAB_3_SELECT_VALUE_1),
            );
            expect(getUrlStateParam(page)).toEqual(PARAMS.TAB_3_STATE_HASH_1);
        },
    );

    datalensTest(
        'Checking whether the state parameter is saved when changing different types of selectors and when switching to another tab and back',
        async ({page}: {page: Page}) => {
            // Select another selector value on the first tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            let urlParam = await waitClickElemGetUrlStateParam({
                page,
                selector: `css=[data-qa=${SELECTORS.TAB_SELECTOR_KEY}-items] * >> text=${PARAMS.TAB_1_SELECT_VALUE_2}`,
            });
            // Check that the state parameter has changed after a new selection in the selector based on the dataset
            expect(urlParam).toEqual(PARAMS.TAB_1_STATE_HASH_2);

            // Click on the second tab and wait for the update in the url
            urlParam = await waitClickTabGetUrlStateParam({page, tabText: 'Tab 2'});
            // Check that the state parameter was reset when switching to the second tab
            expect(urlParam).toEqual(null);

            // Click on the first tab and wait for the page url to change
            urlParam = await waitClickTabGetUrlStateParam({
                page,
                tabText: 'Tab 1',
            });
            // Check that the state parameter has been preserved after returning to the previous tab
            expect(urlParam).toEqual(PARAMS.TAB_1_STATE_HASH_2);

            // Waiting for the chart to be drawn
            await page.waitForSelector(`${slct(SELECTORS.CHART_KEY)} ${SELECTORS.CHART_BODY_PATH}`);
            const items = await page.$$(
                `${slct(SELECTORS.CHART_KEY)} ${SELECTORS.CHART_BODY_PATH}`,
            );
            // Check that the chart has been drawn with the applied values of the selector parameters based on the dataset
            expect(items).toHaveLength(2);

            // Click on the third tab and wait for the page url to change
            urlParam = await waitClickTabGetUrlStateParam({page, tabText: 'Tab 3'});
            // Check that the state parameter has been reset
            expect(urlParam).toEqual(null);

            // Select the value of the external selector on the third tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            urlParam = await waitSelectOptionGetUrlStateParam({
                page,
                selector: SELECTORS.TAB_SELECTOR_KEY,
                value: PARAMS.TAB_3_SELECT_VALUE_1,
            });
            // Check that the state parameter was updated when the external selector was changed
            expect(urlParam).toEqual(PARAMS.TAB_3_STATE_HASH_1);

            // Click on the second tab and wait for the update in the url
            urlParam = await waitClickTabGetUrlStateParam({page, tabText: 'Tab 2'});
            // Check that the state parameter has been reset
            expect(urlParam).toEqual(null);

            // Select the value of the manual selector on the second tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            urlParam = await waitSelectOptionGetUrlStateParam({
                page,
                selector: SELECTORS.TAB_SELECTOR_KEY,
                value: PARAMS.TAB_2_SELECT_VALUE_1,
            });
            // Check that the state parameter has been updated after selecting the value of the manual selector
            expect(urlParam).toEqual(PARAMS.TAB_2_STATE_HASH_1);

            // Click on the third tab and wait for the page url to change
            urlParam = await waitClickTabGetUrlStateParam({page, tabText: 'Tab 3'});
            // Check that the state parameter has been restored
            expect(urlParam).toEqual(PARAMS.TAB_3_STATE_HASH_1);

            // Click on the second tab and wait for the page url to change
            urlParam = await waitClickTabGetUrlStateParam({page, tabText: 'Tab 2'});
            // Check that the state parameter has been restored
            expect(urlParam).toEqual(PARAMS.TAB_2_STATE_HASH_1);
        },
    );

    datalensTest(
        'Checking backward transitions in the browser and consistency of the state parameter when changing different types of selectors and when switching to another tab',
        async ({page}: {page: Page}) => {
            // Select another selector value on the first tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            let urlParam = await waitClickElemGetUrlStateParam({
                page,
                selector: `css=[data-qa=${SELECTORS.TAB_SELECTOR_KEY}-items] * >> text=${PARAMS.TAB_1_SELECT_VALUE_2}`,
            });

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the state parameter returned to the state of the first selected
            expect(urlParam).toEqual(PARAMS.TAB_1_STATE_HASH_1);

            // Waiting for the chart to be drawn
            await page.waitForSelector(`${slct(SELECTORS.CHART_KEY)} ${SELECTORS.CHART_BODY_PATH}`);
            let items = await page.$$(`${slct(SELECTORS.CHART_KEY)} ${SELECTORS.CHART_BODY_PATH}`);
            // Check that the chart has been drawn with the applied values of the selector parameters based on the dataset
            expect(items).toHaveLength(1);

            // Click on the second tab and wait for the update in the url
            await waitClickTabGetUrlStateParam({page, tabText: 'Tab 2'});

            // Select the value of the manual selector on the second tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            urlParam = await waitSelectOptionGetUrlStateParam({
                page,
                selector: SELECTORS.TAB_SELECTOR_KEY,
                value: PARAMS.TAB_2_SELECT_VALUE_1,
            });
            // Check that the state parameter has been updated after selecting the value of the manual selector
            expect(urlParam).toEqual(PARAMS.TAB_2_STATE_HASH_1);

            // Click on the third tab and wait for the page url to change
            urlParam = await waitClickTabGetUrlStateParam({page, tabText: 'Tab 3'});
            // Check that the state parameter has been reset
            expect(urlParam).toEqual(null);

            // Select the value of the external selector on the third tab and
            // waiting for the deferred request to create a state and add it to the url to pass
            urlParam = await waitSelectOptionGetUrlStateParam({
                page,
                selector: SELECTORS.TAB_SELECTOR_KEY,
                value: PARAMS.TAB_3_SELECT_VALUE_1,
            });
            // Check that the state parameter was updated when the external selector was changed
            expect(urlParam).toEqual(PARAMS.TAB_3_STATE_HASH_1);

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the state parameter returned to the state of the not selected selector on the third tab
            expect(urlParam).toEqual(null);

            let selector = await page.$(
                `${slct(SELECTORS.TAB_SELECTOR_KEY)} >> ${SELECTORS.TAB_SELECTOR_TEXT}`,
            );
            let selectorText = await selector?.innerText();
            // Check that the selector value has been reset when switching back
            expect(selectorText).toEqual(PARAMS.TAB_3_SELECT_VALUE_DEFAULT);

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the state parameter returned to the state of the selector on the second tab
            expect(urlParam).toEqual(PARAMS.TAB_2_STATE_HASH_1);

            selector = await page.$(
                `${slct(SELECTORS.TAB_SELECTOR_KEY)} >> ${SELECTORS.TAB_SELECTOR_TEXT}`,
            );
            selectorText = await selector?.innerText();
            // Check that when switching back, the selector value has returned to the state on the second tab
            expect(selectorText).toEqual(PARAMS.TAB_2_SELECT_VALUE_1);

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the state parameter returned to the state of the not selected selector on the second tab
            expect(urlParam).toEqual(null);

            selector = await page.$(
                `${slct(SELECTORS.TAB_SELECTOR_KEY)} >> ${SELECTORS.TAB_SELECTOR_TEXT}`,
            );
            selectorText = await selector?.innerText();
            // Check that when switching back, the selector value has returned to the state on the second tab
            const defaultValue = await page.$(`${SELECTORS.EMPTY_SELECTOR_VAL}`);
            const defaultValueText = await defaultValue?.innerText();

            expect(selectorText).toEqual(defaultValueText);

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the selector value has returned to the state on the first tab
            expect(urlParam).toEqual(PARAMS.TAB_1_STATE_HASH_1);

            // Waiting for the chart to be drawn
            await page.waitForSelector(`${slct(SELECTORS.CHART_KEY)} ${SELECTORS.CHART_BODY_PATH}`);
            items = await page.$$(`${slct(SELECTORS.CHART_KEY)} ${SELECTORS.CHART_BODY_PATH}`);
            // Check that the chart has been drawn with the applied values of the selector parameters based on the dataset
            expect(items).toHaveLength(1);

            // We return to the browser by clicking the back button
            urlParam = await waitBackGetUrlStateParam(page);
            // Check that when switching back, the selector value has returned to the unselected state on the first tab
            expect(urlParam).toEqual(null);

            // Waiting for the chart to be drawn
            await page.waitForSelector(`${slct(SELECTORS.CHART_KEY)} ${SELECTORS.CHART_BODY_PATH}`);
            items = await page.$$(`${slct(SELECTORS.CHART_KEY)} ${SELECTORS.CHART_BODY_PATH}`);
            // Check that the chart has been drawn with the applied values of the selector parameters based on the dataset
            expect(items).not.toEqual(1);
        },
    );
});
