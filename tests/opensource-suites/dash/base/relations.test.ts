import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {
    deleteEntity,
    getUniqueTimestamp,
    openTestPage,
    slct,
    waitForCondition,
} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ConnectionsDialogQA} from '../../../../src/shared';
import {WorkbooksUrls} from 'constants/constants';
import {Workbook} from 'page-objects/workbook/Workbook';
import {ChartsParams} from 'constants/test-entities/charts';

const SELECTORS = {
    CHART_LEGEND_ITEM: '.chartkit-d3-legend__item',
    CONTROL_SELECT_ITEMS_KEY: 'chartkit-control-select-items',
};
const PARAMS = {
    DASH_NAME_PREFIX: 'e2e-test-dash',
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
            const workbookPO = new Workbook(page);

            await openTestPage(page, WorkbooksUrls.E2EWorkbook);

            await workbookPO.createEntryButton.createDashboard();

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

            await dashboardPage.saveChanges();

            const dashName = `${PARAMS.DASH_NAME_PREFIX}-${getUniqueTimestamp()}`;
            await workbookPO.dialogCreateEntry.waitForOpen();
            await workbookPO.dialogCreateEntry.fillNameField(dashName);
            await workbookPO.dialogCreateEntry.clickApplyButton();

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

            await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
        },
    );
});
