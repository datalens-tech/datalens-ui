import {Page} from '@playwright/test';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {clickSelectOption, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import {ControlQA, DialogDashWidgetQA, ParamsSettingsQA} from '../../../../src/shared/constants/qa';
import {COMMON_DASH_SELECTORS} from '../constants';

const PARAMS = {
    WIDGET_PARAM_NAME: 'Weather',
    INITIAL_SELECTOR_PARAM_VALUE: '2017',
    RESULT_SELECTOR_PARAM_VALUE: '2019',
    EDITOR_PARAM_VALUE: 'Good',
};

const checkWidgetParam = async (page: Page, dashboardPage: DashboardPage) => {
    await dashboardPage.forceEnterEditMode();
    // edit the second widget - editor chart
    const editWidgetControls = await page.$$(slct(ControlQA.controlSettings));
    await editWidgetControls[1].click();

    const paramsButton = await page.$(slct(ParamsSettingsQA.Open));
    await paramsButton?.click();

    const paramRows = await page.$$(slct(ParamsSettingsQA.ParamRow));
    expect(paramRows.length).toEqual(1);

    const paramInput = await page.waitForSelector(`${slct(ParamsSettingsQA.ParamTitle)} input`);
    const paramInputValue = await paramInput.inputValue();
    expect(paramInputValue).toBe(PARAMS.WIDGET_PARAM_NAME);
    await page.waitForSelector(
        `${slct(ParamsSettingsQA.ParamValue)} >> text=${PARAMS.EDITOR_PARAM_VALUE}`,
    );

    await page.click(slct(DialogDashWidgetQA.Cancel));
    await dashboardPage.exitEditMode();
};

datalensTest.describe(`Dashboards - parameters in editor widget`, () => {
    datalensTest(
        'Changes in the influencing selector do not affect the params in the editor chart widget',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithEditorChartWithParams);

            // check the selector param and the widget param in markdown
            await page.waitForSelector(
                `${slct(COMMON_DASH_SELECTORS.DASH_PLUGIN_WIDGET_BODY)} >> text=${
                    PARAMS.INITIAL_SELECTOR_PARAM_VALUE
                }`,
            );
            await page.waitForSelector(
                `${slct(COMMON_DASH_SELECTORS.DASH_PLUGIN_WIDGET_BODY)} >> text=${
                    PARAMS.EDITOR_PARAM_VALUE
                }`,
            );

            await checkWidgetParam(page, dashboardPage);

            // change the value in the selector
            await dashboardPage.waitForSelector(slct(ControlQA.controlSelect));
            await clickSelectOption(
                page,
                ControlQA.controlSelect,
                PARAMS.RESULT_SELECTOR_PARAM_VALUE,
            );

            // check that the selector param has changed
            await page.waitForSelector(
                `${slct(COMMON_DASH_SELECTORS.DASH_PLUGIN_WIDGET_BODY)} >> text=${
                    PARAMS.RESULT_SELECTOR_PARAM_VALUE
                }`,
            );
            // check that the widget param hasn't changed
            await page.waitForSelector(
                `${slct(COMMON_DASH_SELECTORS.DASH_PLUGIN_WIDGET_BODY)} >> text=${
                    PARAMS.EDITOR_PARAM_VALUE
                }`,
            );

            // check that the param hasn't changed
            await checkWidgetParam(page, dashboardPage);
        },
    );
});
