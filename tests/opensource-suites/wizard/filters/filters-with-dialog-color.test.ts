import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';
import {WizardVisualizationId} from '../../../../src/shared';

const chartNamePattern = 'e2e-wizard-filters';

const setupFilters = async (wizardPage: WizardPage) => {
    await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'city');
    await wizardPage.filterEditor.selectValues(['Los Angeles', 'Akron']);
    await wizardPage.filterEditor.apply();

    await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'Sales');
    await wizardPage.filterEditor.selectValues(['122.352']);
    await wizardPage.filterEditor.apply();
};

datalensTest.describe('Wizard filters', () => {
    datalensTest.beforeEach(async ({page, config}) => {
        await openTestPage(page, config.wizard.urls.WizardBasicDataset);
    });

    datalensTest.afterEach(async ({page}) => {
        await page.reload();
        const pageUrl = page.url();

        if (pageUrl.includes(chartNamePattern)) {
            const wizardPage = new WizardPage({page});
            await wizardPage.deleteEntry();
        }
    });

    datalensTest(
        'All chart filters must be taken into account in the color dialog',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'city');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'city');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'city');

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

    datalensTest(
        'Two or more values of the Date field from the dashboard filter section should use IN operation by default',
        async ({page}: {page: Page}) => {
            const dateFilterValues = ['2015-01-01', '2016-01-01'];
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.PieD3);

            await wizardPage.createNewFieldWithFormula(
                'order_year',
                `DATETRUNC([Order_date], 'year')`,
            );
            await wizardPage.createNewFieldWithFormula('sum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'order_year',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'sum');

            await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName(chartNamePattern));

            const pageUrl = new URL(page.url());
            dateFilterValues.forEach((d) => pageUrl.searchParams.append('order_year', d));
            await page.goto(pageUrl.toString());

            await wizardPage.colorDialog.open();
            await wizardPage.colorDialog.checkFieldValues(dateFilterValues);
            await wizardPage.colorDialog.close();
        },
    );
});
