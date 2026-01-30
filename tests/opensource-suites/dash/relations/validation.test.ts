import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashCommonQa, DashTabItemControlSourceType, TitlePlacements} from '../../../../src/shared';
import {TestParametrizationConfig} from '../../../types/config';

const PARAMS = {
    WARNING_SAME_DATASET_FIELDS:
        'You cannot create aliases between fields of the same dataset or between fields with the same ID in different datasets.',
};

datalensTest.describe('Dashboards - Relations (new), validation', () => {
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });
    datalensTest(
        'Check for unable adding new alias for widget on same dataset',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelector({
                        appearance: {titlePlacement: TitlePlacements.Left},
                        sourceType: DashTabItemControlSourceType.Dataset,
                        dataset: {innerText: 'Dataset'},
                        datasetField: {idx: 1},
                    });

                    await dashboardPage.addChart({
                        name: config.dash.charts.ChartCityPie.name,
                        url: config.dash.charts.ChartCityPie.url,
                        hideTitle: true,
                    });
                },
            });

            await dashboardPage.enterEditMode();

            const selectorElem = await dashboardPage.controlActions.getDashControlLinksIconElem();

            await selectorElem.click();
            await page.hover(slct(DashCommonQa.RelationsListRow));
            await page.locator(slct(DashCommonQa.AliasShowBtn)).click();

            await dashboardPage.waitForSelector(`text=${PARAMS.WARNING_SAME_DATASET_FIELDS}`);

            await dashboardPage.cancelAliasesChanges();
            await dashboardPage.cancelRelationsChanges();
            await dashboardPage.exitEditMode();
        },
    );
});
