import {WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

const chartNamePattern = 'e2e-wizard';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
        });

        datalensTest.afterEach(async ({page}) => {
            const wizardPage = new WizardPage({page});
            await wizardPage.deleteEntry();
        });

        datalensTest(
            'Event "chart-preview.done" is triggered after the table is rendered',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.FlatTableColumns,
                    'Category',
                );

                await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName(chartNamePattern));
                const previewPage = await wizardPage.openAsPreview();

                // check event
                await previewPage.evaluateHandle(() => {
                    return new Promise((resolve) =>
                        document.body.addEventListener('chart-preview.done', resolve),
                    );
                });
                await previewPage.close();
            },
        );

        datalensTest(
            'Event "chart-preview.done" is triggered for table with no data',
            async ({page}) => {
                const wizardPage = new WizardPage({page});

                await wizardPage.createNewFieldWithFormula('filter', 'false');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Filters,
                    'filter',
                );
                await wizardPage.filterEditor.selectRadio('true');
                await wizardPage.filterEditor.apply();

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.FlatTableColumns,
                    'Category',
                );

                await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName(chartNamePattern));
                const previewPage = await wizardPage.openAsPreview();

                // check event
                await previewPage.evaluateHandle(() => {
                    return new Promise((resolve) =>
                        document.body.addEventListener('chart-preview.done', resolve),
                    );
                });
                await previewPage.close();
            },
        );
    });
});
