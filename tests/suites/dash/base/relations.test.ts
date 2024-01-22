import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {
    getControlByTitle,
    getUniqueTimestamp,
    openTestPage,
    slct,
    waitForCondition,
} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ConnectionsDialogQA} from '../../../../src/shared';

const SELECTORS = {
    CHART_LEGEND_ITEM: '.highcharts-legend-item',
    CONTROL_SELECT_KEY: 'chartkit-control-select',
    CONTROL_SELECT_ITEMS_KEY: 'chartkit-control-select-items',
};
const PARAMS = {
    DASH_NAME_PREFIX: 'e2e-test-dash',
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_ITEMS: ['91000', '98800'],
    CHART_NAME: 'csv-based-dataset — Pie chart',
    CHART_URL: '/wizard/9ez4zmky3tccy',
    CHART_FIELD: 'Population String',
};

datalensTest.describe('Dashboards are Basic functionality', () => {
    datalensTest(
        'Adding a chart and selector with manual input of values, creating a link',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            const dashName = `${PARAMS.DASH_NAME_PREFIX}-${getUniqueTimestamp()}`;

            await openTestPage(page, '/dashboards');

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addSelector({
                        controlTitle: PARAMS.CONTROL_TITLE,
                        controlFieldName: PARAMS.CONTROL_FIELD_NAME,
                        controlItems: PARAMS.CONTROL_ITEMS,
                    });

                    await dashboardPage.addChart({
                        chartName: PARAMS.CHART_NAME,
                        chartUrl: PARAMS.CHART_URL,
                    });
                    await dashboardPage.setupLinks({
                        linkType: ConnectionsDialogQA.TypeSelectOutputOption,
                        chartField: PARAMS.CHART_FIELD,
                        selectorName: PARAMS.CONTROL_TITLE,
                    });
                },
                dashName,
            });

            await waitForCondition(async () => {
                const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);
                return elems.length > 2;
            });

            // we get a control by name
            const control = await getControlByTitle(page, PARAMS.CONTROL_TITLE);

            // open the select, click on the option
            const controlSelect = await control.waitForSelector(slct(SELECTORS.CONTROL_SELECT_KEY));
            await controlSelect.click();

            const defaultSelectValue = PARAMS.CONTROL_ITEMS[PARAMS.CONTROL_ITEMS.length - 1];

            await page.click(slct(SELECTORS.CONTROL_SELECT_ITEMS_KEY, defaultSelectValue));

            // making sure that the request has then completed successfully
            await waitForCondition(async () => {
                const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);

                return elems.length === 2;
            });

            await dashboardPage.deleteDashFromViewMode();
        },
    );
});
