import {Page} from '@playwright/test';

import {openTestPage, slct} from '../../../utils';
import {RobotChartsEditorUrls} from '../../../utils/constants';
import EditorPage from '../../../page-objects/editor/EditorPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {
    EditorActionPanelQA,
    EditorPaneQA,
    RevisionsListQa,
    RevisionsPanelQa,
    SaveChartControlsQa,
} from '../../../../src/shared';

const PARAMS = {
    TEST_TEXT: '{}',
};

datalensTest.describe('Charts - Editor versioning', () => {
    datalensTest('Check possible states of revision panel', async ({page}: {page: Page}) => {
        const editorPage = new EditorPage({page});
        await openTestPage(page, RobotChartsEditorUrls.EditorNewMarkup);

        await editorPage.saveEditorEntry('editor-versioning');

        // check that there is one actual revision
        await editorPage.revisions.checkRevisionsStatusCount({
            all: 1,
            actual: 1,
        });

        // make draft version
        const promise = editorPage.waitForSuccessfulResponse('/api/run');
        await page.locator(slct(EditorActionPanelQA.MoreSwitcher)).click();
        await page.locator(slct(EditorActionPanelQA.SaveAsDraftButton)).click();
        await promise;

        // checkt state of draft version
        await page.locator(slct(RevisionsPanelQa.DraftVersion)).isVisible();

        // check that there is now one actual and one draft
        await editorPage.revisions.checkRevisionsStatusCount({
            all: 2,
            actual: 1,
            draft: 1,
        });

        await page.locator(slct(EditorPaneQA.ParamsTab)).click();
        await page.locator(`${slct(EditorPaneQA.Editor)} >> textarea`).fill(PARAMS.TEST_TEXT);

        // TODO: remove after fix not updating list
        await page.locator(slct(RevisionsListQa.ExpandablePanelButtonClose)).click();

        await page.locator(slct(SaveChartControlsQa.SaveButton)).click();

        await editorPage.revisions.checkRevisionsStatusCount({
            all: 3,
            actual: 1,
            draft: 1,
            notActual: 1,
        });

        await editorPage.revisions.openActualRevision();

        // check state of has draft version
        await page.locator(slct(RevisionsPanelQa.HasDraft)).isVisible();

        await editorPage.revisions.openFirstNotActualVersion();

        // TODO: remove after fix not updating list
        await page.locator(slct(RevisionsListQa.ExpandablePanelButtonClose)).click();

        await editorPage.revisions.makeRevisionActual();

        await editorPage.revisions.checkRevisionsStatusCount({
            all: 4,
            actual: 1,
            draft: 0,
            notActual: 3,
        });

        await editorPage.deleteEntry();
    });
});
