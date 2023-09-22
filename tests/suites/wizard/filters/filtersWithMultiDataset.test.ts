import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard filters with multi-datasets', () => {
    datalensTest(
        'When switching between datasets, filters should receive the correct dataset',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedValues = ['Akron', 'Alexandria'];

            await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

            await wizardPage.addAdditionalDataset(RobotChartsDatasets.SampleCHDataset);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');

            await wizardPage.filterEditor.selectValues(expectedValues);

            await waitForCondition(async () => {
                const values = await wizardPage.filterEditor.getSelectedValues();
                const container = await wizardPage.page.$('.dl-dialog-filter__filter-select');
                return container && values.join(',') === expectedValues.join(',');
            });

            await wizardPage.filterEditor.apply();

            await wizardPage.datasetSelector.click();

            await wizardPage.datasetSelector.changeDataset(RobotChartsDatasets.CitiesDataset);

            await wizardPage.filterEditor.openFilterField('City');

            await waitForCondition(async () => {
                const values = await wizardPage.filterEditor.getSelectedValues();
                const container = await wizardPage.page.$('.dl-dialog-filter__filter-select');
                return container && values.join(',') === expectedValues.join(',');
            }).catch(() => {
                throw new Error('Dialog changed between dataset switches');
            });
        },
    );
});
