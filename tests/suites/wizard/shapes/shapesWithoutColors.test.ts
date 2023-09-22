import {expect, Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - using Shapes (without Colors)', () => {
    datalensTest(
        'Should split only by Shapes, the color is the same',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.setVisualization(WizardVisualizationId.Line);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Region');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            const apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Segment',
            );
            await (await apiRunRequest).response();

            await wizardPage.page.locator(wizardPage.chartkit.legendItemSelector).first().waitFor();

            const expected = [
                {
                    legendTitle: 'Consumer',
                    color: '#4DA2F1',
                    shape: 'none',
                },
                {
                    legendTitle: 'Corporate',
                    color: '#4DA2F1',
                    shape: '8,6',
                },
                {
                    legendTitle: 'Home Office',
                    color: '#4DA2F1',
                    shape: '2,6',
                },
            ];

            expect(await wizardPage.chartContainer.getLegendItems()).toEqual(expected);
        },
    );
});
