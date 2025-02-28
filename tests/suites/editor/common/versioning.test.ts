import {Page} from '@playwright/test';

import {openTestPage, slct} from '../../../utils';
import {RobotChartsEditorUrls} from '../../../utils/constants';
import EditorPage from '../../../page-objects/editor/EditorPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {EditorActionPanelQA, EditorPaneQA, RevisionsPanelQa} from '../../../../src/shared';

const PARAMS = {
    TEST_TEXT: ' ',
};

datalensTest.describe('Charts - Editor versioning', () => {
    datalensTest(
        'Different revision panels are displayed in draft, not actual and the actual with draft revisions',
        async ({page}: {page: Page}) => {
            const editorPage = new EditorPage({page});

            await openTestPage(page, RobotChartsEditorUrls.EditorNewMarkup);
            await editorPage.saveEditorEntry('editor-versioning-states');

            await editorPage.revisions.checkRevisionsStatusCount({
                all: 1,
                actual: 1,
            });

            await editorPage.makeDraft();

            // check state of draft version
            await page.locator(slct(RevisionsPanelQa.DraftVersion)).isVisible();

            await editorPage.revisions.checkRevisionsStatusCount({
                all: 2,
                actual: 1,
                draft: 1,
            });

            await page.locator(`${slct(EditorPaneQA.Editor)} >> textarea`).fill(PARAMS.TEST_TEXT);

            await editorPage.saveExistingEntry();

            await page.locator(slct(RevisionsPanelQa.DraftVersion)).isVisible();

            await editorPage.revisions.checkRevisionsStatusCount({
                all: 3,
                actual: 1,
                draft: 1,
                notActual: 1,
            });

            await editorPage.openActualRevision();

            // check state of has draft version
            await page.locator(slct(RevisionsPanelQa.HasDraft)).isVisible();

            await editorPage.revisions.openFirstNotActualVersion();

            await editorPage.makeRevisionActual();

            await editorPage.revisions.checkRevisionsStatusCount({
                all: 4,
                actual: 1,
                draft: 0,
                notActual: 3,
            });
        },
    );

    datalensTest('Making draft actual adds one more revision', async ({page}: {page: Page}) => {
        const editorPage = new EditorPage({page});

        await openTestPage(page, RobotChartsEditorUrls.EditorNewMarkup);
        await editorPage.saveEditorEntry('editor-versioning-draft-test');

        await editorPage.makeDraft();

        await page.locator(`${slct(EditorPaneQA.Editor)} >> textarea`).fill(PARAMS.TEST_TEXT);

        await page.locator(slct(EditorActionPanelQA.MoreSwitcher)).click();
        await page.locator(slct(EditorActionPanelQA.SaveAndPublishButton)).click();

        await editorPage.revisions.checkRevisionsStatusCount({
            all: 3,
            actual: 1,
            notActual: 2,
        });
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const editorPage = new EditorPage({page});
        await editorPage.deleteEntry();
    });
});
