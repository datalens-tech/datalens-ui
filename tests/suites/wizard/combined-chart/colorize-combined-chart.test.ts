import {expect} from '@playwright/test';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CommonUrls} from '../../../page-objects/constants/common-urls';

// todo: remove along with GravityChartsForLineAreaAndBarX feature flag
datalensTest.describe('Wizard - Coloring of combined charts', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
    });

    datalensTest(
        'When adding the second Y field, the chart should be colored by Measure Names',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            const expectedColors = ['#4DA2F1', '#FF3D64'];

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            let receivedColors: string[] = [];

            await waitForCondition(async () => {
                receivedColors = await wizardPage.chartContainer.getSeriesColors(false);

                return receivedColors.join(',') === expectedColors.join(',');
            }).catch(() => {
                throw new Error(
                    `Not correctly colored by Measure Names: ${receivedColors.join(
                        ',',
                    )}, expected: ${expectedColors.join(',')}`,
                );
            });
        },
    );

    datalensTest(
        'Indicators on the layers are different, measurements in colors are different -> legend in the format "indicator name: measurement name: measurement value"',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Segment',
            );

            await wizardPage.sectionVisualization.addLayer();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            const apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Region');

            await (await apiRunRequest).response();
            await wizardPage.page.locator(wizardPage.chartkit.legendItemSelector).first().waitFor();

            const expected = [
                {
                    legendTitle: 'Sales: Segment: Consumer',
                    color: '#4DA2F1',
                    shape: 'none',
                },
                {
                    legendTitle: 'Sales: Segment: Corporate',
                    color: '#FF3D64',
                    shape: 'none',
                },
                {
                    legendTitle: 'Sales: Segment: Home Office',
                    color: '#8AD554',
                    shape: 'none',
                },
                {
                    legendTitle: 'Profit: Region: Central',
                    color: '#FFC636',
                    shape: 'none',
                },
                {
                    legendTitle: 'Profit: Region: East',
                    color: '#FFB9DD',
                    shape: 'none',
                },
                {
                    legendTitle: 'Profit: Region: South',
                    color: '#84D1EE',
                    shape: 'none',
                },
                {
                    legendTitle: 'Profit: Region: West',
                    color: '#FF91A1',
                    shape: 'none',
                },
            ];

            expect(await wizardPage.chartContainer.getLegendItems()).toEqual(expected);
        },
    );

    datalensTest(
        'Indicators on the layers are different, measurements in colors are the same -> legend in the format "indicator name: measurement value"',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Segment',
            );

            await wizardPage.sectionVisualization.addLayer();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            const apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Segment',
            );

            await (await apiRunRequest).response();
            await wizardPage.page.locator(wizardPage.chartkit.legendItemSelector).first().waitFor();

            const expected = [
                {
                    legendTitle: 'Sales: Consumer',
                    color: '#4DA2F1',
                    shape: 'none',
                },
                {
                    legendTitle: 'Sales: Corporate',
                    color: '#FF3D64',
                    shape: 'none',
                },
                {
                    legendTitle: 'Sales: Home Office',
                    color: '#8AD554',
                    shape: 'none',
                },
                {
                    legendTitle: 'Profit: Consumer',
                    color: '#FFC636',
                    shape: 'none',
                },
                {
                    legendTitle: 'Profit: Corporate',
                    color: '#FFB9DD',
                    shape: 'none',
                },
                {
                    legendTitle: 'Profit: Home Office',
                    color: '#84D1EE',
                    shape: 'none',
                },
            ];

            expect(await wizardPage.chartContainer.getLegendItems()).toEqual(expected);
        },
    );

    datalensTest(
        'The indicators on the layers are the same, the measurements in the colors are different -> legend in the format "measurement name: measurement value"',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Segment',
            );

            await wizardPage.sectionVisualization.addLayer();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            const apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Region');

            await (await apiRunRequest).response();
            await wizardPage.page.locator(wizardPage.chartkit.legendItemSelector).first().waitFor();

            const expected = [
                {
                    legendTitle: 'Segment: Consumer',
                    color: '#4DA2F1',
                    shape: 'none',
                },
                {
                    legendTitle: 'Segment: Corporate',
                    color: '#FF3D64',
                    shape: 'none',
                },
                {
                    legendTitle: 'Segment: Home Office',
                    color: '#8AD554',
                    shape: 'none',
                },
                {
                    legendTitle: 'Region: Central',
                    color: '#FFC636',
                    shape: 'none',
                },
                {
                    legendTitle: 'Region: East',
                    color: '#FFB9DD',
                    shape: 'none',
                },
                {
                    legendTitle: 'Region: South',
                    color: '#84D1EE',
                    shape: 'none',
                },
                {
                    legendTitle: 'Region: West',
                    color: '#FF91A1',
                    shape: 'none',
                },
            ];

            expect(await wizardPage.chartContainer.getLegendItems()).toEqual(expected);
        },
    );

    datalensTest(
        'Indicators and measurements in the colors on the layers are the same -> legend in the format "measurement value"',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Region');

            await wizardPage.sectionVisualization.addLayer();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            const apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Region');

            await (await apiRunRequest).response();
            await wizardPage.page.locator(wizardPage.chartkit.legendItemSelector).first().waitFor();

            const expected = [
                {
                    legendTitle: 'Central',
                    color: '#4DA2F1',
                    shape: 'none',
                },
                {
                    legendTitle: 'East',
                    color: '#FF3D64',
                    shape: 'none',
                },
                {
                    legendTitle: 'South',
                    color: '#8AD554',
                    shape: 'none',
                },
                {
                    legendTitle: 'West',
                    color: '#FFC636',
                    shape: 'none',
                },
            ];

            expect(await wizardPage.chartContainer.getLegendItems()).toEqual(expected);
        },
    );
});
