import {Page} from '@playwright/test';

import {ChartPage} from '../../../page-objects/ChartPage';
import {RobotChartsPreviewUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const PARAMS = {
    defaultParam: 'ParamsValue',
    urlParam: 'UrlValue',
    tempParam: 'TempValue',
    resetButtonLabel: 'Reset',
    applyButtonLabel: 'Apply',
};

datalensTest.describe('Preview - reset button for editorial selectors', () => {
    datalensTest(
        'In the editorial selector without updateOnChange, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsPreviewUrls.PreviewInputWithReset);

            await chartPage.checkApplyAndResetParams(
                PARAMS.defaultParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
                PARAMS.applyButtonLabel,
            );
        },
    );
    datalensTest(
        'In the editorial selector without updateOnChange, with parameters in the url, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(
                page,
                `${RobotChartsPreviewUrls.PreviewInputWithReset}?testValue=${PARAMS.urlParam}`,
            );

            await chartPage.checkApplyAndResetParams(
                PARAMS.urlParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
                PARAMS.applyButtonLabel,
            );
        },
    );
    datalensTest(
        'In an editorial chart with a selector without updateOnChange, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsPreviewUrls.PreviewTableAndInputWithReset);

            await chartPage.checkApplyAndResetParams(
                PARAMS.defaultParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
                PARAMS.applyButtonLabel,
            );
        },
    );
    datalensTest(
        'In an editorial chart with a selector without updateOnChange, with parameters in the url, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(
                page,
                `${RobotChartsPreviewUrls.PreviewTableAndInputWithReset}?testValue=${PARAMS.urlParam}`,
            );

            await chartPage.checkApplyAndResetParams(
                PARAMS.urlParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
                PARAMS.applyButtonLabel,
            );
        },
    );
    datalensTest(
        'In the editorial selector with updateOnChange, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsPreviewUrls.PreviewSelectWithReset);

            await chartPage.checkResetParams(
                PARAMS.defaultParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
            );
        },
    );
    datalensTest(
        'In the editorial selector with updateOnChange, with parameters in the url, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(
                page,
                `${RobotChartsPreviewUrls.PreviewSelectWithReset}?selectValue=${PARAMS.urlParam}`,
            );

            await chartPage.checkResetParams(
                PARAMS.urlParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
            );
        },
    );
    datalensTest(
        'In an editorial chart with a selector with updateOnChange, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsPreviewUrls.PreviewTableAndSelectWithReset);

            await chartPage.checkResetParams(
                PARAMS.defaultParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
            );
        },
    );
    datalensTest(
        'In the editorial chart with the updateOnChange selector, with parameters in the url, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(
                page,
                `${RobotChartsPreviewUrls.PreviewTableAndSelectWithReset}?selectValue=${PARAMS.urlParam}`,
            );

            await chartPage.checkResetParams(
                PARAMS.urlParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
            );
        },
    );
});
