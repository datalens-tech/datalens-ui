import {expect, Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition, waitForValidSearchParams} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - filters', () => {
    const placeholderItemSelector = '.data-qa-placeholder-item';

    datalensTest(
        'Filters from the URL should be placed in the Dashboard Filters placeholder and can be opened by the user for detailed viewing',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithDashboardFilters);

            await waitForCondition(async () => {
                const dashboardFiltersTexts =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.DashboardFilters,
                    );

                return dashboardFiltersTexts.join().includes(['City'].join());
            }).catch(() => {
                throw new Error('Filters from the dashboard have not sprouted into the wizard');
            });

            await wizardPage.filterEditor.openFilterField('City', PlaceholderName.DashboardFilters);

            await waitForCondition(async () => {
                const selectedValues = await wizardPage.filterEditor.getSelectedValues();

                return selectedValues.length === 1 && selectedValues[0] === 'Jejsk';
            });
        },
    );

    datalensTest(
        'Filters removed from UI should also be removed from parameter URLs',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithDashboardFilters);
            await waitForValidSearchParams({
                page,
                error: 'The Search parameter is not contained in the URL',
                param: 'city_sfqq',
                shouldIncludeParam: true,
            });

            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.DashboardFilters,
                'City',
            );

            await waitForValidSearchParams({
                page,
                error: 'Filters from dashboards have not been removed from the URL',
                shouldIncludeParam: false,
                param: 'city_sfqq',
            });

            const chartUrl = '/wizard/cyv7bagmagoc6';
            const searchParams = new URLSearchParams();
            searchParams.set('City', 'Barnaul');

            await openTestPage(page, chartUrl + '?' + searchParams);

            await waitForValidSearchParams({
                page,
                error: 'The Search parameter is not contained in the URL',
                shouldIncludeParam: true,
                param: 'City',
            });

            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.DashboardFilters,
                'City',
            );

            await waitForValidSearchParams({
                page,
                error: 'Filters from dashboards have not been removed from the URL',
                shouldIncludeParam: false,
                param: 'City',
            });
        },
    );

    datalensTest(
        'When adding filters from the dashboard, a tooltip should appear',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithDashboardFilters);
            await wizardPage.page.locator('.placeholder-tooltip-icon').hover();

            const tooltipContent = wizardPage.page.locator('.placeholder-icon-tooltip-content');
            await expect(tooltipContent).toBeVisible();
        },
    );

    datalensTest(
        'URL filters should be taken into account when opening the chart in a new tab',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithDashboardFilters);

            const newTabPage = await wizardPage.chartkit.openInNewTab();

            await waitForValidSearchParams({
                page: newTabPage,
                error: 'The Search parameter is not contained in the URL',
                shouldIncludeParam: true,
                param: 'city_sfqq',
            });
        },
    );

    datalensTest(
        'Filters from the URL should be taken into account when saving the chart as images',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithDashboardFilters);

            const newTabPage = await wizardPage.chartkit.saveAsPicture();

            await waitForValidSearchParams({
                page: newTabPage,
                error: 'The Search parameter is not contained in the URL',
                shouldIncludeParam: true,
                param: 'city_sfqq',
            });
        },
    );

    datalensTest(
        'The chart should open without errors if the URLParams has the __datasetId parameter',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsWizardUrls.WizardWithDatasetIdInUrl);

            const wizardLocator = await page.locator('.wizard');

            await expect(wizardLocator).toBeVisible();
        },
    );

    datalensTest(
        'Filters from the Dashboard can be changed and changes can be saved',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithDashboardFilters);

            await wizardPage.filterEditor.openFilterField('City', PlaceholderName.DashboardFilters);

            await wizardPage.filterEditor.selectValues(['Barnaul', 'Abakan']);

            const successfulResponsePromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.filterEditor.apply();

            await successfulResponsePromise;

            const result = [
                {
                    key: 'Rank',
                    value: '__gt_1',
                },
                {
                    key: 'city_sfqq',
                    value: '__IN_Abakan',
                },
                {
                    key: 'city_sfqq',
                    value: '__IN_Barnaul',
                },
                {
                    key: 'city_sfqq',
                    value: '__IN_Jejsk',
                },
            ];

            const params = await wizardPage.getUrlParams();

            expect(params).toMatchObject(result);

            const expectedRowsText = ['Abakan', 'Barnaul', 'Jejsk'];

            await waitForCondition(async () => {
                const rowsText = await wizardPage.chartkit.getRowsTexts();

                return rowsText.join() === expectedRowsText.join();
            });
        },
    );

    datalensTest(
        'If you add a filter to the chart that is in the dashboard filters section, the dashboard filter will be removed',
        async ({page}) => {
            const wizardPage = new WizardPage({page});
            const dashboardFilterItems = wizardPage.page.locator(
                `${slct(PlaceholderName.DashboardFilters)} ${placeholderItemSelector}`,
            );

            await openTestPage(page, RobotChartsWizardUrls.WizardWithDashboardFilters);

            await waitForCondition(async () => {
                const tableDataWithDashboardFilter = await wizardPage.chartkit.getRowsTexts();

                return tableDataWithDashboardFilter.join() === ['Jejsk'].join();
            });

            expect(await dashboardFilterItems.count()).toEqual(2);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');

            await wizardPage.filterEditor.selectValues(['Abakan', 'Barnaul']);

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.filterEditor.apply();

            await apiRunPromise;

            expect(await dashboardFilterItems.count()).toEqual(1);

            await waitForCondition(async () => {
                const tableDataWithoutDashboardFilter = await wizardPage.chartkit.getRowsTexts();

                return tableDataWithoutDashboardFilter.join() === ['Abakan', 'Barnaul'].join();
            });
        },
    );

    datalensTest(
        'If there is an empty filter in the chart that is not displayed, then when you add a filter for this field, it will be removed from the URL',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithEmptyDashboardFilter);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');

            await wizardPage.filterEditor.selectValues(['Abakan', 'Barnaul']);

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.filterEditor.apply();

            await apiRunPromise;

            const params = await wizardPage.getUrlParams();

            expect(params).toMatchObject([]);

            await waitForCondition(async () => {
                const tableDataWithoutDashboardFilter = await wizardPage.chartkit.getRowsTexts();

                return tableDataWithoutDashboardFilter.join() === ['Abakan', 'Barnaul'].join();
            });
        },
    );

    datalensTest(
        'Move field from "Filters from dashboard" to "Filters"',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithDashboardFilters);

            const filterItems = wizardPage.page.locator(
                `${slct(PlaceholderName.Filters)} ${placeholderItemSelector}`,
            );
            const dashboardFilterItems = wizardPage.page.locator(
                `${slct(PlaceholderName.DashboardFilters)} ${placeholderItemSelector}`,
            );

            await expect(filterItems).toHaveText([]);
            await expect(dashboardFilterItems).toHaveText(['City: Jejsk', 'Rank: 1']);

            await wizardPage.sectionVisualization.dragAndDropFieldBetweenPlaceholders({
                from: PlaceholderName.DashboardFilters,
                to: PlaceholderName.Filters,
                fieldName: 'City',
            });

            await expect(filterItems).toHaveText(['City: Jejsk']);
            await expect(dashboardFilterItems).toHaveText(['Rank: 1']);
        },
    );
});
