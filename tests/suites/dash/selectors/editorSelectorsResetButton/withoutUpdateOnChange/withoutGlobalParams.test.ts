import {Page} from '@playwright/test';

import {RobotChartsDashboardUrls} from '../../../../../utils/constants';
import datalensTest from '../../../../../utils/playwright/globalTestDefinition';
import {ChartPage} from '../../../../../page-objects/ChartPage';
import {openTestPage} from '../../../../../utils';

const PARAMS = {
    selectorParam: 'ParamsValue',
    urlParam: 'UrlValue',
    tempParam: 'TempValue',
    stateParam: 'StateValue',
    widgetParam: 'WidgetValue',
    resetButtonLabel: 'Reset',
    applyButtonLabel: 'Apply',
};

datalensTest.describe(
    'Dashboards - Button to reset editorial selectors without updateOnChange without set global parameters',
    () => {
        datalensTest(
            'When the state is specified in the url, the button resets the editorial selector to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=3B&state=e64fd90f112`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.stateParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                    PARAMS.applyButtonLabel,
                );
            },
        );
        datalensTest(
            'In an editorial chart with a selector with widget parameters, the button resets to widget parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=Nx`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.widgetParam,
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
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=wV`,
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
            'In the editorial selector, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=3B`,
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
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=Nx&testValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkApplyAndResetParams(
                    PARAMS.widgetParam,
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
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=wV&testValue=${PARAMS.urlParam}`,
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
            'With parameters in the url in the editor selector, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=3B&testValue=${PARAMS.urlParam}`,
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
    },
);
