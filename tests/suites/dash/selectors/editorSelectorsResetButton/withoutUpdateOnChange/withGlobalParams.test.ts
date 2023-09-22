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
    applyButtonLabel: 'Apply',
};

datalensTest.describe(
    'Dashboards - Button to reset editorial selectors without updateOnChange with global parameters set',
    () => {
        datalensTest(
            'In an editorial chart with a selector with widget parameters, the button resets to widget parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=Nx`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.dashParam,
                    PARAMS.widgetParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                    PARAMS.applyButtonLabel,
                );
            },
        );
        datalensTest(
            'In an editorial chart with a selector without widget parameters, the button resets to selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=Lm`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.dashParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                    PARAMS.applyButtonLabel,
                );
            },
        );
        datalensTest(
            'In the editorial selector, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=3B`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.selectorParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                    PARAMS.applyButtonLabel,
                );
            },
        );
        datalensTest(
            'With parameters in the url in the editorial chart with a selector with widget parameters, the button resets to widget parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=Nx&testValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.urlParam,
                    PARAMS.widgetParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                    PARAMS.applyButtonLabel,
                );
            },
        );
        datalensTest(
            'With parameters in the url in the editorial chart with a selector without widget parameters, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=Lm&testValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.urlParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                    PARAMS.applyButtonLabel,
                );
            },
        );
        datalensTest(
            'With parameters in the url in the editor selector, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithParams}?tab=3B&testValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.urlParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                    PARAMS.applyButtonLabel,
                );
            },
        );
    },
);
