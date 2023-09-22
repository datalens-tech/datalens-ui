import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const setupFilters = async (wizardPage: WizardPage) => {
    await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');
    await wizardPage.filterEditor.selectValues(['Abakan', 'Jejsk']);
    await wizardPage.filterEditor.apply();

    await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'Rank');
    await wizardPage.filterEditor.selectValues(['187']);
    await wizardPage.filterEditor.apply();
};

datalensTest.describe('Wizard filters', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'City');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'City');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'City');
    });

    datalensTest(
        'All chart filters must be taken into account in the color dialog',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.colorDialog.open();

            const valuesWithoutFilters = await wizardPage.colorDialog.getFieldValues();

            await wizardPage.colorDialog.close();

            await setupFilters(wizardPage);

            await wizardPage.colorDialog.open();

            const valuesWithFilters = await wizardPage.colorDialog.getFieldValues();

            await wizardPage.colorDialog.close();

            expect(valuesWithoutFilters).not.toEqual(valuesWithFilters);

            expect(valuesWithFilters).toEqual(['Jejsk']);
        },
    );
});
