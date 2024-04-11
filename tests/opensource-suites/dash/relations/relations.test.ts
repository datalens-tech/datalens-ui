import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct, waitForCondition} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ControlQA, DashCommonQa, DashRelationTypes} from '../../../../src/shared';
import {TestParametrizationConfig} from '../../../types/config';

const SELECTORS = {
    CHART_LEGEND_ITEM: '.chartkit-d3-legend__item',
    CONTROL_SELECT_ITEMS_KEY: 'chartkit-control-select-items',
};

const PARAMS = {
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_ITEMS: ['Dallas', 'Chicago'],
    CHART_FIELD: 'City',
};

datalensTest.describe('Dashboards - Relations (new)', () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addSelector({
                        controlTitle: PARAMS.CONTROL_TITLE,
                        controlFieldName: PARAMS.CONTROL_FIELD_NAME,
                        controlItems: PARAMS.CONTROL_ITEMS,
                    });

                    await dashboardPage.addChart({
                        name: config.dash.charts.ChartCityPie.name,
                        url: config.dash.charts.ChartCityPie.url,
                        hideTitle: true,
                    });
                },
            });
        },
    );
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });
    datalensTest(
        'Adding a chart and selector with manual input of values, creating a link (new relations)',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.enterEditMode();

            const selectorElem = await dashboardPage.getDashControlLinksIconElem(
                ControlQA.controlLinks,
            );

            await dashboardPage.setupNewLinks({
                linkType: DashRelationTypes.output,
                firstParamName: PARAMS.CONTROL_FIELD_NAME,
                secondParamName: PARAMS.CHART_FIELD,
                widgetElem: selectorElem,
            });

            await dashboardPage.clickSaveButton();

            await waitForCondition(async () => {
                const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);
                return elems.length > 2;
            });

            await dashboardPage.clickSelectWithTitle(PARAMS.CONTROL_TITLE);

            const defaultSelectValue = PARAMS.CONTROL_ITEMS[PARAMS.CONTROL_ITEMS.length - 1];

            await page.click(slct(SELECTORS.CONTROL_SELECT_ITEMS_KEY, defaultSelectValue));

            // making sure that the request has then completed successfully
            await waitForCondition(async () => {
                const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);

                return elems.length === 1;
            });
        },
    );
    datalensTest('Remove alias (new relations)', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.enterEditMode();

        const selectorElem = await dashboardPage.getDashControlLinksIconElem(
            ControlQA.controlLinks,
        );

        await dashboardPage.setupNewLinks({
            linkType: DashRelationTypes.output,
            firstParamName: PARAMS.CONTROL_FIELD_NAME,
            secondParamName: PARAMS.CHART_FIELD,
            widgetElem: selectorElem,
        });

        await dashboardPage.saveChanges();
        await dashboardPage.page.reload();

        await dashboardPage.enterEditMode();

        // open dialog relations by click on control item links icon
        await selectorElem.click();
        // open aliases list popup
        await page.locator(slct(DashCommonQa.AliasShowBtn)).first().click();
        // expand added aliases list
        await page.locator(slct(DashCommonQa.AliasesListCollapse)).click();

        // hover to show controls
        await page.hover(slct(DashCommonQa.AliasItem));
        // remove alias
        await page.locator(slct(DashCommonQa.AliasRemoveBtn)).click();

        // apply all
        await dashboardPage.applyAliasesChanges();
        await dashboardPage.applyRelationsChanges();
        await dashboardPage.saveChanges();

        await dashboardPage.clickSelectWithTitle(PARAMS.CONTROL_TITLE);

        const defaultSelectValue = PARAMS.CONTROL_ITEMS[PARAMS.CONTROL_ITEMS.length - 1];

        await page.click(slct(SELECTORS.CONTROL_SELECT_ITEMS_KEY, defaultSelectValue));

        // making sure that the request has then completed successfully
        await waitForCondition(async () => {
            const elems = await page.$$(SELECTORS.CHART_LEGEND_ITEM);

            return elems.length > 2;
        });
    });
});
