import {Page} from '@playwright/test';

import EditorPage from '../../page-objects/editor/EditorPage';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../utils';
import {RobotChartsEditorUrls} from '../../utils/constants';
import {DEFAULT_QUERY} from '../../page-objects/constants/base';

const SELECTORS = {
    RUN_BUTTON: '[data-qa=button-draw-preview]',
    CHARKIT_ERROR: '[data-qa=chartkit-error]',
};

const PARAMS = {
    ERROR_TITLE: 'ERR.CHARTS.RUNTIME_ERROR',
};

datalensTest.describe('Editor passing JS errors to the user', () => {
    datalensTest('User should see a readable error', async ({page}: {page: Page}) => {
        const editorPage = new EditorPage({page});
        await openTestPage(page, RobotChartsEditorUrls.EditorEmptyDraft, DEFAULT_QUERY);
        await editorPage.drawPreview();
        const editor = await page.waitForSelector('.view-line');
        await editor.click();
        await editor.type('Hello World!');
        const runButton = await page.waitForSelector(SELECTORS.RUN_BUTTON);
        await runButton.click();
        const charkitError = await page.waitForSelector(SELECTORS.CHARKIT_ERROR);
        const errotTitle = await charkitError.waitForSelector('.datalens-chartkit-error__title');
        const errorText = await charkitError.waitForSelector(
            '.datalens-chartkit-error__code-block',
        );
        // eslint-disable-next-line no-script-url
        expect(await errorText.innerText()).toContain('SyntaxError: Unexpected identifier');
        expect(await errotTitle.getAttribute('data-qa')).toContain(PARAMS.ERROR_TITLE);
    });
});
