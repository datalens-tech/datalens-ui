import {Page} from '@playwright/test';

import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage} from '../../../utils';

datalensTest.describe('Ql - chart loading', () => {
    datalensTest(
        'When trying to switch to Ql from the wizard chart id, a redirect to the Wizard page occurs',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsSQLEditorUrls.QLWithWizardId);

            await page.waitForURL(`**/wizard/**`);
            const wizardPage = new WizardPage({page});
            await wizardPage.chartkit.waitForSuccessfulRender();
        },
    );
});
