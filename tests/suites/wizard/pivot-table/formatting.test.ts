import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Summary Table, formatting', () => {
    datalensTest(
        'The cell must be formatted according to the field settings (there is a prefix, a postfix and 4 decimal places)',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.PivotTableWithFormattedMeasures);

            const rows = await wizardPage.chartkit.getRowsTexts();

            expect(rows).toEqual([['Consumer', 'PREFIX 0,0000 POSTFIX']]);
        },
    );

    datalensTest(
        'The column header must be formatted according to the field settings (there is a prefix, a postfix and 4 decimal places)',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.PivotTableWithFormattedHeader);

            const rows = await wizardPage.chartkit.getHeadRowsTexts();

            expect(rows).toEqual([['Segment', 'PREFIX 0,0000 POSTFIX']]);
        },
    );

    datalensTest(
        'The line header must be formatted according to the field settings (there is a prefix, a postfix and 4 decimal places)',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.PivotTableWithFormattedRowHeader);

            const rows = await wizardPage.chartkit.getRowsTexts();

            expect(rows).toEqual([['PREFIX 0,0000 POSTFIX', '0,00']]);
        },
    );
});
