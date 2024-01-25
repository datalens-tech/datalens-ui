import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ControlQA, DashCommonQa} from '../../../../src/shared';
import {ChartsParams} from '../../../constants/test-entities/charts';

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
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addSelectorBySettings({});

                    await dashboardPage.addChart({
                        chartName: ChartsParams.citySalesPieChart.name,
                        chartUrl: ChartsParams.citySalesPieChart.url,
                        hideTitle: true,
                    });
                },
            });
            await dashboardPage.enterEditMode();

            const selectorElem = await dashboardPage.getDashControlLinksIconElem(
                ControlQA.controlLinks,
            );

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
