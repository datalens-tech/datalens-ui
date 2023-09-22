import {Page} from '@playwright/test';

import {ChartPage} from '../../../../../page-objects/ChartPage';
import {RobotChartsDashboardUrls} from '../../../../../utils/constants';
import datalensTest from '../../../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../../../utils';

const PARAMS = {
    selectorParam: 'ParamsValue',
    urlParam: 'UrlValue',
    tempParam: 'TempValue',
    widgetParam: 'WidgetValue',
    dashParam: 'DashValue',
    resetButtonLabel: 'Reset',
};

datalensTest.describe(
    'Dashboards - Reset button for editorial selectors with updateOnChange with global parameters set',
    () => {
        datalensTest(
            'In an editorial chart with a selector with widget parameters, the button resets to widget parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=wV`,
                );

                await chartPage.checkResetParams(
                    PARAMS.dashParam,
                    PARAMS.widgetParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                );
            },
        );
        datalensTest(
            'In an editorial chart with a selector without widget parameters, the button resets to selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=oV`,
                );

                await chartPage.checkResetParams(
                    PARAMS.dashParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                );
            },
        );
        datalensTest(
            'In the editorial selector, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=9j`,
                );

                await chartPage.checkResetParams(
                    PARAMS.selectorParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                );
            },
        );
        datalensTest(
            'With parameters in the url in the editorial chart with a selector with widget parameters, the button resets to widget parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=wV&selectValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkResetParams(
                    PARAMS.urlParam,
                    PARAMS.widgetParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                );
            },
        );
        datalensTest(
            'With parameters in the url in the editorial chart with a selector without widget parameters, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=oV&selectValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkResetParams(
                    PARAMS.urlParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                );
            },
        );
        datalensTest(
            'With parameters in the url in the editor selector, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=9j&selectValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkResetParams(
                    PARAMS.urlParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                );
            },
        );
    },
);
