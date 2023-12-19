import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';

import {
    deleteEntity,
    getUniqueTimestamp,
    openTestPage,
    slct,
    waitForCondition,
} from '../../../utils';

import {COMMON_SELECTORS} from '../../../utils/constants';
import {
    ControlQA,
    DialogDashWidgetQA,
    NavigationInputQA,
    ParamsSettingsQA,
    TabMenuQA,
} from '../../../../src/shared/constants';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {Workbook} from '../../../page-objects/workbook/Workbook';
import {WorkbooksUrls} from '../../../constants/constants';
import {ChartsParams} from '../../../constants/test-entities/charts';

const DASH_PARAMS: Array<[string, string]> = [
    ['param1', ''],
    ['param2', 'value1'],
    ['param2', 'value2'],
    ['param2', 'value3'],
    ['param3', 'value1'],
];

const checkNewParams = async (page: Page) => {
    // checking for a new view of parameter setting
    const newParamsButton = await page.$(slct(ParamsSettingsQA.Open));
    let isNewParams = false;
    if (newParamsButton !== null) {
        const newParams = await page.$(slct(ParamsSettingsQA.Settings));

        if (!newParams) {
            await newParamsButton.click();
        }
        isNewParams = true;
    }

    return isNewParams;
};

const getParamsFromPage = async (
    page: Page,
    {isOldDialogParams}: {isOldDialogParams?: boolean} = {},
) => {
    const isNewParams = await checkNewParams(page);

    // if the type of parameters is new
    if (isNewParams) {
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
    }

    // if the view of parameters is old, but the values need to be retrieved from the dialog
    if (isOldDialogParams) {
        // opening the parameters dialog
        await page.click(slct(ParamsSettingsQA.AddOld));

        // getting the entire list of parameters
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
                    const valuesEl = await paramRow.$$(
                        `${slct(ParamsSettingsQA.ParamValue)} input`,
                    );

                    // if there are no parameter values, adding a parameter without a value
                    if (valuesEl.length < 1) {
                        paramsSeed.push(`${title}=`);
                        return paramsSeed;
                    }

                    for (let i = 0; i < valuesEl.length; i++) {
                        const valuePromise = valuesEl[i]?.inputValue();

                        const value = ((await valuePromise) || '').trim();

                        paramsSeed.push(`${title}=${value}`);
                    }
                    return paramsSeed;
                })(),
            ),
        );

        // closing the parameters dialog
        await page.click(slct(ParamsSettingsQA.ApplyOld));

        // transforming to a single-level array of all parameters from an array of arrays
        return paramsContent.flat();
    }

    // if the view of parameters is old without a dialog, then getting all the values at once
    const paramsEl = await page.$$(slct(ParamsSettingsQA.ParamContentOld));

    const paramsContent = await Promise.all(paramsEl.map((el) => el.textContent()));

    const params = paramsContent.map((param) => (param || '').trim());
    return params;
};

const addParam = async (page: Page, param: {title: string; value: string}) => {
    const isNewParams = await checkNewParams(page);

    if (isNewParams) {
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
            const paramValueInput = await lastParamRow.$(
                `${slct(ParamsSettingsQA.ParamValue)} input`,
            );
            await paramValueInput?.fill(param.value);

            // shifting the focus from the input field for the value is preserved
            await paramTitleInput?.focus();
        }

        return;
    }

    // if the view of parameters is old, then open the dialog for add a parameter and fill in the values
    await page.click(slct(ParamsSettingsQA.AddOld));
    await page.fill(`${slct(ParamsSettingsQA.ParamTitle)} input`, param.title);
    if (param.value) {
        await page.fill(`${slct(ParamsSettingsQA.ParamValue)} input`, param.value);
    }
    await page.click(slct(ParamsSettingsQA.ApplyOld));
};

const removeParam = async (page: Page, paramTitle: string) => {
    const isNewParams = await checkNewParams(page);

    if (isNewParams) {
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

        return;
    }

    // if the view of parameters is old, then first getting all the parameters
    let paramsEl = await page.$$(slct(ParamsSettingsQA.ParamContentOld));
    const paramsContent = await Promise.all(paramsEl.map((el) => el.textContent()));

    const paramsTitles = paramsContent.map((param) => (param || '').split('=').shift()?.trim());

    // finding the index of the parameter to be deleted
    const removeIndex = paramsTitles.findIndex((title) => title === paramTitle);
    if (removeIndex < 0) {
        throw new Error('index of param for delete not found');
    }

    // again getting the full components of the parameters, not just the content
    paramsEl = await page.$$(slct(ParamsSettingsQA.ParamOld));

    // emulating hovering over a parameter to make the delete button appear
    await paramsEl[removeIndex].hover();

    const removeButton = await paramsEl[removeIndex].$(slct(ParamsSettingsQA.ParamRemoveOld));
    await removeButton?.click();
};

datalensTest.describe(`Dashboards - chart/external selector/dashboard parameters`, () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashName = `e2e-test-dash-params-${getUniqueTimestamp()}`;
        const dashboardPage = new DashboardPage({page});
        const workbookPO = new Workbook(page);

        await openTestPage(page, WorkbooksUrls.E2EWorkbook);

        await workbookPO.createEntryButton.createDashboard();

        await dashboardPage.addChart({
            chartName: ChartsParams.citySalesPieChart.name,
            chartUrl: ChartsParams.citySalesPieChart.url,
        });

        await dashboardPage.clickSaveButton();

        await workbookPO.dialogCreateEntry.waitForOpen();
        await workbookPO.dialogCreateEntry.fillNameField(dashName);
        await workbookPO.dialogCreateEntry.clickApplyButton();
    });

    datalensTest(
        'Parsing of chart parameters when adding a chart by link',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await page.click(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));

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
            await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
        },
    );

    datalensTest('Correct addition/removal of parameters', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await page.click(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));
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
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });
});
