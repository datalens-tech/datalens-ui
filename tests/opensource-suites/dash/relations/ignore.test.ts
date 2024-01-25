import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct, waitForCondition} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ControlQA, DashRelationTypes} from '../../../../src/shared';
import {ChartsParams} from '../../../constants/test-entities/charts';

const SELECTORS = {
    CHART_LEGEND_ITEM: '.chartkit-d3-legend__item',
    CONTROL_SELECT_ITEMS_KEY: 'chartkit-control-select-items',
};

const PARAMS = {
    DASH_NAME_PREFIX: 'e2e-test-dash',
    CONTROL_TITLE: 'test-control',
    CONTROL_TITLE_2: 'test-control-2',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_FIELD_NAME_2: 'test-control-field-2',
    CONTROL_ITEMS: ['Dallas', 'Chicago'],
    CHART_FIELD: 'city',
};

datalensTest.describe('Dashboards - Relations (new)', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addSelector({
                    controlTitle: PARAMS.CONTROL_TITLE,
                    controlFieldName: PARAMS.CONTROL_FIELD_NAME,
                    controlItems: PARAMS.CONTROL_ITEMS,
                });
                await dashboardPage.addSelector({
                    controlTitle: PARAMS.CONTROL_TITLE_2,
                    controlFieldName: PARAMS.CONTROL_FIELD_NAME_2,
                    controlItems: PARAMS.CONTROL_ITEMS,
                });

                await dashboardPage.addChart({
                    chartName: ChartsParams.citySalesPieChart.name,
                    chartUrl: ChartsParams.citySalesPieChart.url,
                    hideTitle: true,
                });
            },
        });
        await dashboardPage.enterEditMode();

        // adding links to controls

        const selectorElem = await dashboardPage.getDashControlLinksIconElem(
            ControlQA.controlLinks,
            0,
        );

        await dashboardPage.setupNewLinks({
            linkType: DashRelationTypes.output,
            firstParamName: PARAMS.CONTROL_FIELD_NAME,
            secondParamName: PARAMS.CHART_FIELD,
            widgetElem: selectorElem,
        });

        const selectorElem2 = await dashboardPage.getDashControlLinksIconElem(
            ControlQA.controlLinks,
            1,
        );

        await dashboardPage.setupNewLinks({
            linkType: DashRelationTypes.output,
            firstParamName: PARAMS.CONTROL_FIELD_NAME_2,
            secondParamName: PARAMS.CHART_FIELD,
            widgetElem: selectorElem2,
        });
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });
    datalensTest('Ignore relations by manual change', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        const selectorElem = await dashboardPage.getDashControlLinksIconElem(
            ControlQA.controlLinks,
            0,
        );

        const selectorElem2 = await dashboardPage.getDashControlLinksIconElem(
            ControlQA.controlLinks,
            1,
        );

        // change link to ignore for controls
        await dashboardPage.setupIgnoreLink(selectorElem);
        await dashboardPage.setupIgnoreLink(selectorElem2);

        await dashboardPage.clickSaveButton();

        // check that after setting ignore link control doesn't affect the chart
        await dashboardPage.clickSelectWithTitle(PARAMS.CONTROL_TITLE);
        const defaultSelectValue = PARAMS.CONTROL_ITEMS[PARAMS.CONTROL_ITEMS.length - 1];
        await page.click(slct(SELECTORS.CONTROL_SELECT_ITEMS_KEY, defaultSelectValue));

        await waitForCondition(async () => {
            const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);
            return elems.length > 2;
        });
    });
    datalensTest('Ignore relations by ignore all button', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        const selectorElem = await dashboardPage.getDashControlLinksIconElem(
            ControlQA.controlLinks,
            0,
        );

        // change link to ignore for controls by disconnect all button
        await dashboardPage.setupIgnoreAllLinks(selectorElem);

        await dashboardPage.clickSaveButton();

        // check that after setting all ignore link control doesn't affect the chart
        await dashboardPage.clickSelectWithTitle(PARAMS.CONTROL_TITLE);
        const defaultSelectValue = PARAMS.CONTROL_ITEMS[PARAMS.CONTROL_ITEMS.length - 1];
        await page.click(slct(SELECTORS.CONTROL_SELECT_ITEMS_KEY, defaultSelectValue));

        await waitForCondition(async () => {
            const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);
            return elems.length > 2;
        });
    });
});
