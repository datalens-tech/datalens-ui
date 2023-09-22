import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RobotChartsWizardUrls} from '../../../utils/constants';

datalensTest.describe('Wizard filters', () => {
    datalensTest(
        'Must correctly parse new dashboard filters from URL',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardUrlOperators, {
                City: '__startswith_Al',
            });

            await waitForCondition(async () => {
                const rows = await wizardPage.chartkit.getRowsTexts();

                const mappedRows = rows.map((el) => el[0]);

                return ['Aleksandrov', 'Aleksin', 'Almetjevsk'].join(',') === mappedRows.join(',');
            });
        },
    );
});
