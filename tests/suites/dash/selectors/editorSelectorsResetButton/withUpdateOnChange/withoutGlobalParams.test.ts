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
};

datalensTest.describe(
    'Dashboards - Reset button for editorial selectors with updateOnChange without global parameters set',
    () => {
        datalensTest(
            'When the state is specified in the url, the button resets the editorial selector to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=jM&state=0041e8b1114`,
                );

                await chartPage.checkResetParams(
                    PARAMS.stateParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                );
            },
        );
        datalensTest(
            'In an editorial chart with a selector with widget parameters, the button resets to widget parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=oV`,
                );

                await chartPage.checkResetParams(
                    PARAMS.widgetParam,
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
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=Lm`,
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
            'In the editorial selector, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=jM`,
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
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=oV&selectValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkResetParams(
                    PARAMS.widgetParam,
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
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=Lm&selectValue=${PARAMS.urlParam}`,
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
            'With parameters in the url in the editor selector, the button resets to the selector parameters',
            async ({page}: {page: Page}) => {
                const chartPage = new ChartPage({page});

                await openTestPage(
                    page,
                    `${RobotChartsDashboardUrls.DashboardWithEditorSelectorsWithoutParams}?tab=jM&selectValue=${PARAMS.urlParam}`,
                );

                await chartPage.checkResetParams(
                    PARAMS.selectorParam,
                    PARAMS.selectorParam,
                    PARAMS.tempParam,
                    PARAMS.resetButtonLabel,
                );
            },
        );
    },
);
