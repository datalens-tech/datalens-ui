import type {Page} from '@playwright/test';
import {expect} from '@playwright/test';

import {VISUALIZATIONS_WITH_NAVIGATOR} from '../../../../src/shared/constants';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {ChartSettingsItems} from '../../../page-objects/wizard/ChartSettings';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {WIZARD_VISULAIZATIONS} from '../constants';

datalensTest.describe('Wizard - chartkit', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'DATE');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

        // Adding another filter, because for some charts the date range is too large and they are not rendered
        // thus, you can miss some error on certain types of visualization
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'DATE');

        await wizardPage.filterEditor.selectRangeDate(['01.10.2017', '28.12.2017']);

        await wizardPage.filterEditor.apply();
    });

    datalensTest(
        'The navigator settings should be in the chart setttings dialog for certain types of visualization',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const checkNavigatorInSettings = async () => {
                const navigatorNode = await wizardPage.page.$(slct(ChartSettingsItems.Navigator));
                return Boolean(navigatorNode);
            };

            const result: string[] = [];

            for (const visualization of WIZARD_VISULAIZATIONS) {
                await wizardPage.setVisualization(visualization);

                await wizardPage.chartSettings.open();
                await wizardPage.chartSettings.waitForSettingsRender();
                const isNavigatorInSettings = await checkNavigatorInSettings();
                if (isNavigatorInSettings) {
                    result.push(visualization as string);
                }

                await wizardPage.chartSettings.close();
            }

            expect(result).toEqual(Array.from(VISUALIZATIONS_WITH_NAVIGATOR));
        },
    );

    datalensTest(
        'The navigator should be rendered if it is enabled in the chart settings',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const waitChartWithoutNavigator = async () => {
                await waitForCondition(async () => {
                    return await wizardPage.page.evaluate(() => {
                        const chart = document.querySelector('.highcharts-root');
                        const navigator = document.querySelector('.highcharts-navigator');

                        return Boolean(chart && !navigator);
                    });
                }).catch(() => {
                    throw new Error('Navigator has not disappeared from the chart');
                });
            };

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Navigator, 'on');

            await wizardPage.chartSettings.apply();

            await expect(wizardPage.page.locator(wizardPage.chartkit.navigator)).toBeVisible();

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Navigator, 'off');

            await wizardPage.chartSettings.apply();

            await waitChartWithoutNavigator();
        },
    );

    datalensTest(
        'Displays all lines if the "All lines" setting is selected',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.waitForSettingsRender();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Navigator, 'on');

            await wizardPage.chartSettings.apply();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );

            let seriesLinesColors: string[] = [];
            await waitForCondition(async () => {
                seriesLinesColors = await wizardPage.chartContainer.getSeriesColors(false);

                return seriesLinesColors.length === 3;
            }).catch(() => {
                throw new Error(
                    `The number of lines is ${seriesLinesColors.length}, and 3 were expected`,
                );
            });

            let seriesNavigatorColors: string[] = [];
            await waitForCondition(async () => {
                seriesNavigatorColors = await wizardPage.chartContainer.getSeriesColors(true);

                return seriesNavigatorColors.length === 3;
            }).catch(() => {
                throw new Error(`Number of lines ${seriesNavigatorColors.length}, and expected 3`);
            });

            expect(seriesLinesColors).toEqual(seriesNavigatorColors);
        },
    );

    datalensTest(
        'Displays only the selected lines in the navigator if the "Select lines" setting is selected',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Region');

            // wait for chart rerender highcharts-legend after colors applied
            await wizardPage.waitForSelector(
                `${wizardPage.chartkit.legendItemSelector} >> text=West`,
            );

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.waitForSettingsRender();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Navigator, 'on');

            await wizardPage.chartSettings.setNavigatorLinesMode('selected');

            await wizardPage.chartSettings.selectLines(['Central', 'South']);

            await wizardPage.chartSettings.apply();

            const expectedResult = ['#4DA2F1', '#8AD554'];
            let chartSeries: string[] = [];
            await waitForCondition(async () => {
                chartSeries = await wizardPage.chartContainer.getSeriesColors(false);

                return chartSeries.length === 4;
            }).catch(() => {
                throw new Error(`The chart should have 4 lines, and we got ${chartSeries.length}`);
            });

            let navigatorSeriesColors: string[] = [];

            await waitForCondition(async () => {
                navigatorSeriesColors = await wizardPage.chartContainer.getSeriesColors(true);

                return navigatorSeriesColors.join(',') === expectedResult.join(',');
            }).catch(() => {
                throw new Error(
                    `Colors were expected for the selected lines ${expectedResult.join(
                        ',',
                    )}, and the result ${navigatorSeriesColors.join(',')}`,
                );
            });
        },
    );

    datalensTest(
        'If no lines are selected in the setup, then draws an empty navigator',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.waitForSettingsRender();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Navigator, 'on');

            await wizardPage.chartSettings.setNavigatorLinesMode('selected');

            await wizardPage.chartSettings.apply();

            let navigatorSeries: string[] | null = null;
            let chartSeries: string[] = [];

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Region');

            await waitForCondition(async () => {
                chartSeries = await wizardPage.chartContainer.getSeriesColors(false);

                return chartSeries.length === 4;
            }).catch(() => {
                throw new Error(
                    `4 lines were expected for charter, ${chartSeries.length} were drawn.`,
                );
            });

            await waitForCondition(async () => {
                navigatorSeries = await wizardPage.chartContainer.getSeriesColors(true);

                return navigatorSeries && navigatorSeries.length === 0;
            }).catch(() => {
                throw new Error(
                    `0 lines were expected in the navigator, but ${
                        navigatorSeries ? navigatorSeries.length : navigatorSeries
                    } were drawn `,
                );
            });
        },
    );

    datalensTest(
        'Navigator settings should be saved when switching between visualizations that support navigator',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Navigator, 'on');

            await wizardPage.chartSettings.apply();

            const visualizationIds = Object.values(WizardVisualizationId);

            for (const visualizationId of visualizationIds) {
                if (VISUALIZATIONS_WITH_NAVIGATOR.has(visualizationId)) {
                    await wizardPage.setVisualization(visualizationId);

                    await wizardPage.chartSettings.open();

                    await wizardPage.chartSettings.waitForSettingsRender();

                    // Check that when switching visualizations, the setting is not turned off
                    await wizardPage.chartSettings.checkSettingMode(
                        ChartSettingsItems.Navigator,
                        'on',
                    );

                    await wizardPage.chartSettings.close();
                }
            }
        },
    );

    datalensTest(
        'Navigator settings should be saved when switching between visualizations that do not support navigator',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Navigator, 'on');

            await wizardPage.chartSettings.apply();

            await wizardPage.setVisualization(WizardVisualizationId.Column);

            await wizardPage.setVisualization(WizardVisualizationId.Area);

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.checkSettingMode(ChartSettingsItems.Navigator, 'on');
        },
    );
});
