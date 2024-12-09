import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import DashboardSettings from '../../../page-objects/dashboard/DashboardSettings';
import {getUniqueTimestamp, openTestPage, slct, waitForCondition} from '../../../utils';
import {dragAndDropListItem} from '../helpers';

import {RobotChartsDashboardUrls, RobotChartsEditorUrls} from '../../../utils/constants';
import {
    ControlQA,
    DialogDashWidgetQA,
    NavigationInputQA,
    ParamsSettingsQA,
    TabMenuQA,
} from '../../../../src/shared/constants';
import {RESTRICTED_PARAM_NAMES} from '../../../../src/shared/constants/dash';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const DASH_PARAMS: Array<[string, string]> = [
    ['param1', ''],
    ['param2', 'value1'],
    ['param2', 'value2'],
    ['param2', 'value3'],
    ['param3', 'value1'],
];

const openParams = async (page: Page) => {
    const newParamsButton = await page.$(slct(ParamsSettingsQA.Open));
    if (newParamsButton !== null) {
        const newParams = await page.$(slct(ParamsSettingsQA.Settings));

        if (!newParams) {
            await newParamsButton.click();
        }
    }
};

const getParamsFromPage = async (page: Page) => {
    await openParams(page);

    // getting the entire list of parameters without errors
    const paramRows = await page.$$(slct(ParamsSettingsQA.ParamRow));

    // for each row, getting the parameters and values in the array of arrays
    const paramsContent = await Promise.all(
        paramRows.map((paramRow) =>
            (async () => {
                const paramsSeed: string[] = [];

                // getting the name of the parameter
                const titleEl = await paramRow.$(`${slct(ParamsSettingsQA.ParamTitle)} input`);
                const title = ((await titleEl?.inputValue()) || '').trim();

                // if the parameter name is empty, then ignoring the line
                if (title === '') {
                    return paramsSeed;
                }

                // getting the parameter values
                const valuesEl = await paramRow.$$(slct(ParamsSettingsQA.ParamValue));

                // if there are no parameter values, adding a parameter without a value
                if (valuesEl.length < 1) {
                    paramsSeed.push(`${title}=`);
                    return paramsSeed;
                }

                for (let i = 0; i < valuesEl.length; i++) {
                    const valuePromise = valuesEl[i]?.textContent();

                    const value = ((await valuePromise) || '').trim();

                    paramsSeed.push(`${title}=${value}`);
                }
                return paramsSeed;
            })(),
        ),
    );

    // transforming to single-level array of all parameters from an array of arrays
    return paramsContent.flat();
};

const addParam = async (page: Page, param: {title: string; value: string}) => {
    await openParams(page);

    // click the add parameters button to ensure that a new line appears
    await page.click(slct(ParamsSettingsQA.Add));

    // getting the entire list of parameters
    const paramRows = await page.$$(slct(ParamsSettingsQA.ParamRow));

    // getting all the parameter names
    const paramRowsTitles = await Promise.all(
        paramRows.map((paramRow) =>
            (async () => {
                const titleEl = await paramRow.$(`input`);
                const title = ((await titleEl?.inputValue()) || '').trim();

                return title;
            })(),
        ),
    );

    // finding the index of the first line of the parameter with an empty name
    const addIndex = paramRowsTitles.findIndex((title) => title === '');

    const lastParamRow = paramRows[addIndex];

    // filling the name of the parameter
    const paramTitleInput = await lastParamRow.$(`${slct(ParamsSettingsQA.ParamTitle)} input`);
    paramTitleInput?.fill(param.title);

    if (param.value) {
        // click on the button to add a new value for the input field appears
        const addParamValueButton = await lastParamRow.$(slct(ParamsSettingsQA.ParamAddValue));
        await addParamValueButton?.click();

        // finding the parameter value input field and add the value
        const paramValueInput = await lastParamRow.$(`${slct(ParamsSettingsQA.ParamValue)} input`);
        await paramValueInput?.fill(param.value);

        // shifting the focus from the input field for the value is preserved
        await paramTitleInput?.focus();
    }
};

const removeParam = async (page: Page, paramTitle: string) => {
    await openParams(page);

    await page.click(slct(ParamsSettingsQA.Add));

    // getting the entire list of parameters
    const paramRows = await page.$$(slct(ParamsSettingsQA.ParamRow));

    // getting all the parameter names
    const paramRowsTitles = await Promise.all(
        paramRows.map((paramRow) =>
            (async () => {
                const titleEl = await paramRow.$(`input`);
                const title = ((await titleEl?.inputValue()) || '').trim();

                return title;
            })(),
        ),
    );

    // finding the index of the parameter to be deleted
    const removeIndex = paramRowsTitles.findIndex((title) => title === paramTitle);
    if (removeIndex < 0) {
        throw new Error('index of param for delete not found');
    }

    // emulating hovering over a line for the delete button to appear
    await paramRows[removeIndex].hover();

    const removeButton = await paramRows[removeIndex].$(slct(ParamsSettingsQA.Remove));
    await removeButton?.click();
};

const addExternalSelector = async (dashboardPage: DashboardPage) => {
    await dashboardPage.enterEditMode();

    await dashboardPage.controlActions.clickAddExternalSelector();
};

datalensTest.describe(`Dashboards - chart/external selector/dashboard parameters`, () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashName = `e2e-test-dash-params-${getUniqueTimestamp()}`;
        const dashboardPage = new DashboardPage({page});
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartDefaultParams);
        await dashboardPage.copyDashboard(dashName);
    });

    datalensTest(
        'Parsing of chart parameters when adding a chart by link',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();
            await page.click(slct(ControlQA.controlSettings));

            // finding the current element with a link to the chart to attach parameters to it
            const chartLinkEl = await dashboardPage.waitForSelector(slct(NavigationInputQA.Open));

            expect(chartLinkEl).not.toBeNull();

            // getting the link from the button
            const chartLink = await chartLinkEl?.getAttribute('href');

            expect(chartLink).not.toBeNull();

            // remember the parameter values before parsing the link
            const currentParams = await getParamsFromPage(page);

            const paramsString = DASH_PARAMS.map(([key, value]) => `${key}=${value}`);
            const chartLinkWithParams = chartLink + '?' + paramsString.join('&');

            // click the add chart button on the link
            await page.click(slct(NavigationInputQA.Link));

            // specifying the link
            await page.fill(`${slct(NavigationInputQA.Input)} input`, chartLinkWithParams);

            // adding
            await page.click(slct(NavigationInputQA.Apply));

            let actualParams: string[] = [];

            // expecting the number of parameters equal to the sum of [number of parameters before] + [number of added]
            await waitForCondition(async () => {
                actualParams = await getParamsFromPage(page);

                return actualParams.length === currentParams.length + paramsString.length;
            });

            // checking the complete match of the old parameters + added with the current ones on the page
            expect(actualParams).toEqual(currentParams.concat(paramsString));

            // adding a new tab with empty parameters
            await page.click(slct(TabMenuQA.Add));

            // click the add chart button on the link
            await page.click(slct(NavigationInputQA.Link));

            // specifying the link
            await page.fill(`${slct(NavigationInputQA.Input)} input`, chartLinkWithParams);

            // adding
            await page.click(slct(NavigationInputQA.Apply));

            actualParams = [];

            // expecting the number of parameters to be equal to [number of added]
            await waitForCondition(async () => {
                actualParams = await getParamsFromPage(page);

                return actualParams.length === paramsString.length;
            });

            // checking the complete match of the added parameters with the current ones on the page
            expect(actualParams).toEqual(paramsString);

            await page.click(slct(DialogDashWidgetQA.Cancel));

            await dashboardPage.exitEditMode();
            await dashboardPage.deleteDashFromViewMode();
        },
    );

    datalensTest(
        'When dragging the chart tabs, the parameters do not change',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();
            await page.click(slct(ControlQA.controlSettings));

            await addParam(page, {title: 'paramDnDCheck', value: 'valueDnDCheck'});

            // getting the current parameters of the first tab
            const firstTabParams = await getParamsFromPage(page);

            const currentTabMenuItems = await page.$$(slct(TabMenuQA.Item));

            // adding a new tab with empty parameters
            await page.click(slct(TabMenuQA.Add));

            let actualTabMenuItems;

            // expecting that the number of chart tabs has increased by 1
            await waitForCondition(async () => {
                actualTabMenuItems = await page.$$(slct(TabMenuQA.Item));

                return actualTabMenuItems.length === currentTabMenuItems.length + 1;
            });

            // dragging the first tab to the place of the added one
            await dragAndDropListItem(page, {
                listSelector: slct(TabMenuQA.List),
                sourceIndex: 0,
                targetIndex: 1,
            });

            actualTabMenuItems = await page.$$(slct(TabMenuQA.Item));

            // switching to the second tab (with the old parameters)
            await actualTabMenuItems[1].click();

            const actualParams = await getParamsFromPage(page);

            // the parameters should remain unchanged
            expect(actualParams).toEqual(firstTabParams);

            await page.click(slct(DialogDashWidgetQA.Cancel));

            await dashboardPage.exitEditMode();
            await dashboardPage.deleteDashFromViewMode();
        },
    );

    datalensTest('Correct addition/removal of parameters', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.enterEditMode();
        await page.click(slct(ControlQA.controlSettings));

        // getting the current chart parameters
        const currentParams = await getParamsFromPage(page);

        const newParamForDelete = ['paramDelete', 'valueDelete'];
        const newParam = ['paramNew', 'valueNew'];

        // adding two parameters
        await addParam(page, {title: newParamForDelete[0], value: newParamForDelete[1]});
        await addParam(page, {title: newParam[0], value: newParam[1]});

        // adding a second parameter with the same name and value
        await addParam(page, {title: newParam[0], value: newParam[1]});

        let actualParams = await getParamsFromPage(page);

        // checking for the existence of two parameters on the page
        expect(actualParams).toEqual(
            currentParams.concat([newParamForDelete.join('='), newParam.join('=')]),
        );

        // delete the parameter
        await removeParam(page, newParamForDelete[0]);

        actualParams = await getParamsFromPage(page);

        // checking that there is no longer a remote one in the parameters on the page
        expect(actualParams).toEqual(currentParams.concat([newParam.join('=')]));

        await page.click(slct(DialogDashWidgetQA.Cancel));

        // adding parameters to a new chart
        await dashboardPage.clickAddChart();

        // adding two parameters
        await addParam(page, {title: newParamForDelete[0], value: newParamForDelete[1]});
        await addParam(page, {title: newParam[0], value: newParam[1]});

        // adding a second parameter with the same name and value
        await addParam(page, {title: newParam[0], value: newParam[1]});

        actualParams = await getParamsFromPage(page);

        // checking for the presence of two parameters on the page
        expect(actualParams).toEqual([newParamForDelete.join('='), newParam.join('=')]);

        // deleting the parameter
        await removeParam(page, newParamForDelete[0]);

        actualParams = await getParamsFromPage(page);

        // checking that there is no longer a remote one in the parameters on the page
        expect(actualParams).toEqual([newParam.join('=')]);

        await page.click(slct(DialogDashWidgetQA.Cancel));

        await dashboardPage.exitEditMode();
        await dashboardPage.deleteDashFromViewMode();
    });

    datalensTest(
        'Validation check when adding dashboard and external selector parameters',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await addExternalSelector(dashboardPage);

            const validParam = ['check_valid_param', 'value'];
            const invalidParamWithUnderscore = ['_check_error_param', ''];
            const invalidParamWithRestricted = [RESTRICTED_PARAM_NAMES[0], ''];

            // adding a parameter with _ (underline)
            await addParam(page, {
                title: invalidParamWithUnderscore[0],
                value: invalidParamWithUnderscore[1],
            });

            // adding a valid parameter
            await addParam(page, {title: validParam[0], value: validParam[1]});

            let actualParams = await getParamsFromPage(page);

            // checking if there is only one valid parameter on the page
            expect(actualParams).toEqual([validParam.join('=')]);

            // closing the dialog for add a selector
            await page.click(slct(ControlQA.dialogControlCancelBtn));

            const dashboardSettings = new DashboardSettings(page);

            // opening the dashboard settings
            await dashboardSettings.open();

            // adding a parameter with _ (underline)
            await addParam(page, {
                title: invalidParamWithUnderscore[0],
                value: invalidParamWithUnderscore[1],
            });

            // adding a forbidden parameter
            await addParam(page, {
                title: invalidParamWithRestricted[0],
                value: invalidParamWithRestricted[1],
            });

            // adding a valid parameter
            await addParam(page, {title: validParam[0], value: validParam[1]});

            actualParams = await getParamsFromPage(page);

            // checking if there is only one valid parameter on the page
            expect(actualParams).toEqual([validParam.join('=')]);

            // closing the dashboard settings
            await dashboardSettings.close();

            await dashboardPage.exitEditMode();
            await dashboardPage.deleteDashFromViewMode();
        },
    );

    datalensTest(
        'The unreleased=1 parameter shows the unpublished version of the editor chart',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await addExternalSelector(dashboardPage);

            await page.click(slct(NavigationInputQA.Link));

            // specifying the link
            await page.fill(
                `${slct(NavigationInputQA.Input)} input`,
                RobotChartsEditorUrls.SelectorWithUnreleasedLogic,
            );

            // adding
            await page.click(slct(NavigationInputQA.Apply));

            // adding the unreleased parameter
            await addParam(page, {title: 'unreleased', value: '1'});

            // adding a selector to the dashboard
            await page.click(slct(ControlQA.dialogControlApplyBtn));

            await dashboardPage.clickSaveButton();

            // checking the correct presence of a selector with unpublished changes
            await dashboardPage.waitForSelector(
                `${slct(ControlQA.controlLabel)} >> text=Unreleased version`,
            );

            await dashboardPage.deleteDashFromViewMode();
        },
    );
});
