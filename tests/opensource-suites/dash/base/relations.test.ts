import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {isEnabledFeature, openTestPage, slct, waitForCondition} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ConnectionsDialogQA, Feature} from '../../../../src/shared';
import {ChartsParams} from '../../../constants/test-entities/charts';

const SELECTORS = {
    CHART_LEGEND_ITEM: '.chartkit-d3-legend__item',
    CONTROL_SELECT_ITEMS_KEY: 'chartkit-control-select-items',
};
const PARAMS = {
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_ITEMS: ['Dallas', 'Chicago'],
    CHART_FIELD: 'city',
};

datalensTest.describe('Dashboards - Basic functionality', () => {
    datalensTest(
        'Adding a chart and selector with manual input of values, creating a link',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            // some page need to be loaded so we can get data of feature flag from DL var
            await openTestPage(page, '/');

            const isEnabledHideOldRelations = await isEnabledFeature(
                page,
                Feature.HideOldRelations,
            );
            if (isEnabledHideOldRelations) {
                return;
            }

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addSelector({
                        controlTitle: PARAMS.CONTROL_TITLE,
                        controlFieldName: PARAMS.CONTROL_FIELD_NAME,
                        controlItems: PARAMS.CONTROL_ITEMS,
                    });

                    await dashboardPage.addChart({
                        chartName: ChartsParams.citySalesPieChart.name,
                        chartUrl: ChartsParams.citySalesPieChart.url,
                    });

                    await dashboardPage.setupLinks({
                        linkType: ConnectionsDialogQA.TypeSelectOutputOption,
                        chartField: PARAMS.CHART_FIELD,
                        selectorName: PARAMS.CONTROL_TITLE,
                    });

                    await dashboardPage.clickSaveButton();
                },
            });

            await waitForCondition(async () => {
                const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);
                return elems.length > 2;
            });

            dashboardPage.clickSelectWithTitle(PARAMS.CONTROL_TITLE);

            const defaultSelectValue = PARAMS.CONTROL_ITEMS[PARAMS.CONTROL_ITEMS.length - 1];

            await page.click(slct(SELECTORS.CONTROL_SELECT_ITEMS_KEY, defaultSelectValue));

            // making sure that the request has then completed successfully
            await waitForCondition(async () => {
                const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);

                return elems.length === 1;
            });

            await dashboardPage.deleteDash();
        },
    );
});
