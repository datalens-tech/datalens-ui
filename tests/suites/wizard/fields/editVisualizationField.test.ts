import {Page, expect} from '@playwright/test';

import {WizardVisualizationId} from '../../../../src/shared';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard Fields', () => {
    datalensTest(
        'Press Fx at the non-formula field, check that the formula was generated correctly',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Region');

            await wizardPage.clickFxForItem('Region');
            await wizardPage.fieldEditor.checkFormula('countd(str([Region]))');
        },
    );

    datalensTest('Creating a new formula field based on Category', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Category',
        );

        await wizardPage.clickFxForItem('Category');

        await wizardPage.fieldEditor.setFormula(` + '123'`);

        await wizardPage.fieldEditor.setName('Cat123');

        await wizardPage.fieldEditor.clickToApplyButton();

        const cellContent = wizardPage.chartkit.getTableLocator().locator('tbody td').first();
        await expect(cellContent).toHaveText('Furniture123');
    });
});
