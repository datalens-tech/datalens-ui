import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Pivot table, markdown', () => {
    datalensTest(
        'The column header should display markdown correctly',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.PivotTableWithMarkdown);

            const rows = await wizardPage.chartkit.getHeadRowsHtml();

            expect(rows[0][1]).toContain('<b>Furniture</b>');
        },
    );

    datalensTest(
        'The line header should display markdown correctly',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.PivotTableWithMarkdown);

            const rows = await wizardPage.chartkit.getRowsHtml();

            expect(rows[0][0]).toEqual(
                '<div class="chartkit-table__content chartkit-table__content_undefined"><b>Consumer</b></div>',
            );
        },
    );
});
