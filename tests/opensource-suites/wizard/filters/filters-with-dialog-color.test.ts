import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';
import {WizardUrls} from '../../../constants/test-entities/wizard';

const setupFilters = async (wizardPage: WizardPage) => {
    await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'city');
    await wizardPage.filterEditor.selectValues(['Los Angeles', 'Akron']);
    await wizardPage.filterEditor.apply();

    await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'Sales');
    await wizardPage.filterEditor.selectValues(['122.352']);
    await wizardPage.filterEditor.apply();
};

datalensTest.describe('Wizard filters', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, WizardUrls.WizardBasicDataset);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'city');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'city');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'city');
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

            expect(valuesWithFilters).toEqual(['Los Angeles']);
        },
    );
});
