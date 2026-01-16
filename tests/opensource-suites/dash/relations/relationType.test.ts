import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashCommonQa, DashRelationTypes} from '../../../../src/shared';
import {TestParametrizationConfig} from '../../../types/config';

const SELECTORS = {
    YC_POPUP: '.g-popup',
};

const PARAMS = {
    CONTROL_TITLE: 'test-control',
    CONTROL_TITLE_2: 'city',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_FIELD_NAME_2: 'city',
    CONTROL_ITEMS: ['Dallas', 'Chicago'],
    CHART_FIELD: 'City',
    RELATION_TYPE_BY_ALIAS: 'by alias',
    RELATION_TYPE_BY_FIELD: 'Category affects city-sales — Pie cha... by field Category',
    RELATION_TEXT: 'city affects city-sales — Pie cha...',
};

datalensTest.describe('Dashboards - Relations types check (new)', () => {
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash();
    });
    datalensTest(
        'Relation by alias',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelector({
                        appearance: {title: PARAMS.CONTROL_TITLE},
                        fieldName: PARAMS.CONTROL_FIELD_NAME,
                        items: PARAMS.CONTROL_ITEMS,
                    });

                    await dashboardPage.addChart({
                        name: config.dash.charts.ChartCityPie.name,
                        url: config.dash.charts.ChartCityPie.url,
                        hideTitle: true,
                    });
                },
            });
            await dashboardPage.enterEditMode();

            // adding links to controls

            const selectorElem = await dashboardPage.controlActions.getDashControlLinksIconElem();

            await dashboardPage.setupNewLinks({
                linkType: DashRelationTypes.output,
                firstParamName: PARAMS.CONTROL_FIELD_NAME,
                secondParamName: PARAMS.CHART_FIELD,
                widgetElem: selectorElem,
            });

            await selectorElem.click();

            await page.locator(slct(DashCommonQa.RelationsListRow)).hover();
            await page.locator(slct(DashCommonQa.RelationsRowPopover)).hover();

            await dashboardPage.waitForSelector(
                `${SELECTORS.YC_POPUP} >> text=${PARAMS.RELATION_TYPE_BY_ALIAS}`,
            );

            await dashboardPage.cancelRelationsChanges();
            await dashboardPage.exitEditMode();
        },
    );
    datalensTest(
        'Relation for manual control with same param as in chart',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelector({
                        appearance: {title: PARAMS.CONTROL_TITLE_2},
                        fieldName: PARAMS.CONTROL_FIELD_NAME_2,
                        items: PARAMS.CONTROL_ITEMS,
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
            await page.hover(slct(DashCommonQa.RelationsRowPopover));

            const popup = page.locator(SELECTORS.YC_POPUP, {hasText: PARAMS.RELATION_TEXT});
            await expect(popup).toBeVisible();

            await dashboardPage.cancelRelationsChanges();
            await dashboardPage.exitEditMode();
        },
    );
    datalensTest(
        'Relation for dataset control',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorWithDefaultSettings({});

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
            await page.hover(slct(DashCommonQa.RelationsRowPopover));

            const popup = page.locator(SELECTORS.YC_POPUP, {
                hasText: PARAMS.RELATION_TYPE_BY_FIELD,
            });
            await expect(popup).toBeVisible();

            await dashboardPage.cancelRelationsChanges();
            await dashboardPage.exitEditMode();
        },
    );
});
