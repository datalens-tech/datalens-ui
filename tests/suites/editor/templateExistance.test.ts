import {Page} from '@playwright/test';

import EditorPage from '../../page-objects/editor/EditorPage';
import {openTestPage, slct} from '../../utils';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {EditorPaneQA, EditorTemplatesQA} from '../../../src/shared/constants/qa/editor';
import {RobotChartsEditorUrls} from '../../utils/constants';
import {DEFAULT_QUERY} from '../../page-objects/constants/base';

datalensTest.describe('ChartEditor template selection', () => {
    datalensTest(
        'Template `Markdown` can be selected and executed',
        async ({page}: {page: Page}) => {
            const editorPage = new EditorPage({page});
            await openTestPage(page, RobotChartsEditorUrls.EditorNew, DEFAULT_QUERY);
            await editorPage.clickTemplate(EditorTemplatesQA.Markdown);
            await editorPage.drawPreview();
            await page.waitForSelector(`${slct('chart-preview')} .chartkit-markdown h1`);
        },
    );

    datalensTest(
        'Template `Selector` can be selected and executed',
        async ({page}: {page: Page}) => {
            const editorPage = new EditorPage({page});
            await openTestPage(page, RobotChartsEditorUrls.EditorNew, DEFAULT_QUERY);
            await editorPage.clickTemplate(EditorTemplatesQA.Selector);
            await editorPage.drawPreview();
            await page.waitForSelector(
                `${slct('chart-preview')} ${slct(
                    'chartkit-control-select',
                )} .yc-select-control__tokens-text >> text=Daily`,
            );
        },
    );

    datalensTest(
        'The template `Module` can be selected and there is a PI in the text',
        async ({page}: {page: Page}) => {
            const editorPage = new EditorPage({page});
            await openTestPage(page, RobotChartsEditorUrls.EditorNew, DEFAULT_QUERY);
            await editorPage.clickTemplate(EditorTemplatesQA.Module);
            await page.waitForSelector(`${slct(EditorPaneQA.Editor)} .view-line >> text=PI`);
        },
    );

    datalensTest('Template `Table` can be selected and executed', async ({page}: {page: Page}) => {
        const editorPage = new EditorPage({page});
        await openTestPage(page, RobotChartsEditorUrls.EditorNew, DEFAULT_QUERY);
        await editorPage.clickTemplate(EditorTemplatesQA.Table);
        await editorPage.drawPreview();
        await page.waitForSelector(
            `${slct('chart-preview')} .chartkit-table .chartkit-table__title`,
        );
    });
});
