import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
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

            await waitForCondition(async () => {
                const formula = await wizardPage.fieldEditor.getFormula();

                return formula === 'countd(str([Region]))';
            });
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

        await waitForCondition(async () => {
            const cell = await wizardPage.page.$(
                '.chartkit-table__content.chartkit-table__content_text',
            );

            return (await cell?.innerText()) === 'Furniture123';
        });
    });
});
