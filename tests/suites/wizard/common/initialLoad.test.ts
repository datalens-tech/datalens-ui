import {Page} from '@playwright/test';

import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import EditorPage from '../../../page-objects/editor/EditorPage';
import QLPage from '../../../page-objects/ql/QLPage';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - chart loading', () => {
    datalensTest(
        'When trying to switch to Wizard from the editor-chart id, a redirect to the Editor page occurs',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsWizardUrls.WizardWithEditorId);

            await page.waitForURL(`**/editor/**`);
            const editorPage = new EditorPage({page});
            await editorPage.drawPreview();
            await editorPage.chartkit.waitForSuccessfulRender();
        },
    );

    datalensTest(
        'When trying to switch to Wizard with the ql chart id, a redirect to the QL page occurs',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsWizardUrls.WizardWithSQLId);

            await page.waitForURL(`**/ql/**`);
            const qlPage = new QLPage({page});
            await qlPage.chartkit.waitForSuccessfulRender();
        },
    );
});
