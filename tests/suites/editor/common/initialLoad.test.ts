import {Page} from '@playwright/test';

import {RobotChartsEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import QLPage from '../../../page-objects/ql/QLPage';
import {openTestPage} from '../../../utils';

datalensTest.describe('Editor - chart loading', () => {
    datalensTest(
        'When trying to go to Editor with the wizard chart id, a redirect to the Wizard page occurs',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsEditorUrls.EditorWithWizardId);

            await page.waitForURL(`**/wizard/**`);
            const wizardPage = new WizardPage({page});
            await wizardPage.chartkit.waitForSuccessfulRender();
        },
    );

    datalensTest(
        'When trying to go to Editor with the ql chart id, a redirect to the QL page occurs',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsEditorUrls.EditorWithSQLId);

            await page.waitForURL(`**/ql/**`);
            const qlPage = new QLPage({page});
            await qlPage.chartkit.waitForSuccessfulRender();
        },
    );
});
