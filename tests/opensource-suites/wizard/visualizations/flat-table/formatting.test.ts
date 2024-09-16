import {expect} from '@playwright/test';

import {WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
        });

        datalensTest('Old date format', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const table = wizardPage.chartkit.getTableLocator();
            const formattedValue = table.locator('td');

            const fieldName = 'old_date';
            await wizardPage.createNewFieldWithFormula(fieldName, "DATETIME('1910-07-01')");
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                fieldName,
            );

            await expect(formattedValue).toHaveText('01.07.1910 00:00:00');
        });
    });
});
