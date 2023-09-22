import {Page, expect} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard requests to api/run ', () => {
    datalensTest(
        'When changing the filters, the api/run should be triggered once when a new chart is created',
        async ({page}: {page: Page}) => {
            const expectedNumberOfRequests = 1;

            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.setVisualization(WizardVisualizationId.Column);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'Region',
            );

            await wizardPage.filterEditor.selectValues(['Central', 'East']);

            let numberOfRequests = 0;

            await wizardPage.page.on('request', (request) => {
                if (request.url().includes('api/run')) {
                    numberOfRequests += 1;
                }
            });

            await wizardPage.filterEditor.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            expect(numberOfRequests).toEqual(expectedNumberOfRequests);
        },
    );

    datalensTest(
        'When changing the filters, the api/run should be triggered once when editing the saved chart',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedNumberOfRequests = 1;
            let numberOfRequests = 0;

            await openTestPage(page, RobotChartsWizardUrls.WizardFlatTable);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'State');

            await wizardPage.filterEditor.selectValues(['Alabama', 'Delaware']);

            await wizardPage.page.on('request', (request) => {
                if (request.url().includes('api/run')) {
                    numberOfRequests += 1;
                }
            });

            await wizardPage.filterEditor.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            expect(numberOfRequests).toEqual(expectedNumberOfRequests);
        },
    );
});
