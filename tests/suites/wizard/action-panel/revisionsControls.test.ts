import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - revision Control panel', () => {
    datalensTest(
        'When opening the revision list, getRevisions is called 1 time',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardTableWithDraftVersion);

            let requestCounter = 0;

            wizardPage.page.on('request', (req) => {
                if (req.url().endsWith('getRevisions')) {
                    requestCounter += 1;
                }
            });

            await wizardPage.revisions.openRevisionsListByRevisionsPanelControl();

            await wizardPage.page.waitForLoadState('networkidle');

            expect(requestCounter).toEqual(1);
        },
    );
});
