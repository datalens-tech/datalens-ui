import {Page} from '@playwright/test';

import {ChartPage} from '../../../page-objects/ChartPage';
import EditorPage from '../../../page-objects/editor/EditorPage';
import {RobotChartsEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const PARAMS = {
    defaultParam: 'ParamsValue',
    urlParam: 'UrlValue',
    tempParam: 'TempValue',
    resetButtonLabel: 'Reset',
    applyButtonLabel: 'Apply',
};

datalensTest.describe('Editor - reset button', () => {
    datalensTest(
        'In the editorial selector without updateOnChange, the button resets to parameters from Params',
        async ({page}: {page: Page}) => {
            const editorPage = new EditorPage({page});
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsEditorUrls.InputWithReset);
            await editorPage.drawPreview();

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
            const editorPage = new EditorPage({page});
            const chartPage = new ChartPage({page});
            await openTestPage(page, `${RobotChartsEditorUrls.InputWithReset}`, {
                testValue: `${PARAMS.urlParam}`,
            });
            await editorPage.drawPreview();

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
            const editorPage = new EditorPage({page});
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsEditorUrls.TableAndInputWithReset);
            await editorPage.drawPreview();

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
            const editorPage = new EditorPage({page});
            const chartPage = new ChartPage({page});

            await openTestPage(
                page,
                `${RobotChartsEditorUrls.TableAndInputWithReset}?testValue=${PARAMS.urlParam}`,
            );
            await editorPage.drawPreview();

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
            const editorPage = new EditorPage({page});
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsEditorUrls.SelectWIthReset);
            await editorPage.drawPreview();

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
            const editorPage = new EditorPage({page});
            const chartPage = new ChartPage({page});
            await openTestPage(
                page,
                `${RobotChartsEditorUrls.SelectWIthReset}?selectValue=${PARAMS.urlParam}`,
            );
            await editorPage.drawPreview();

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
            const editorPage = new EditorPage({page});
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsEditorUrls.TableAndSelectWithReset);
            await editorPage.drawPreview();

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
            const editorPage = new EditorPage({page});
            const chartPage = new ChartPage({page});

            await openTestPage(
                page,
                `${RobotChartsEditorUrls.TableAndSelectWithReset}?selectValue=${PARAMS.urlParam}`,
            );
            await editorPage.drawPreview();

            await chartPage.checkResetParams(
                PARAMS.urlParam,
                PARAMS.defaultParam,
                PARAMS.tempParam,
                PARAMS.resetButtonLabel,
            );
        },
    );
});
