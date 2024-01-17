import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ControlQA, DashCommonQa, DashRelationTypes} from '../../../../src/shared';
import {WorkbooksUrls} from '../../../constants/constants';
import {Workbook} from '../../../page-objects/workbook/Workbook';
import {ChartsParams} from '../../../constants/test-entities/charts';

const SELECTORS = {
    YC_POPUP: '.yc-popup',
};

const PARAMS = {
    CONTROL_TITLE: 'test-control',
    CONTROL_TITLE_2: 'city',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_FIELD_NAME_2: 'city',
    CONTROL_ITEMS: ['Dallas', 'Chicago'],
    CHART_FIELD: 'City',
    RELATION_TYPE_BY_ALIAS: 'by alias',
    RELATION_TYPE_BY_FIELD: 'City affects city-sales — Pie cha... by field City',
    RELATION_TEXT: 'city affects city-sales — Pie cha...',
};

datalensTest.describe('Dashboards - Relations types check (new)', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const workbookPO = new Workbook(page);
        await workbookPO.openE2EWorkbookPage();
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });
    datalensTest('Relation by alias', async ({page}: {page: Page}) => {
        const workbookPO = new Workbook(page);
        const dashboardPage = new DashboardPage({page});
        await workbookPO.createDashboard({
            editDash: async () => {
                await dashboardPage.addSelector({
                    controlTitle: PARAMS.CONTROL_TITLE,
                    controlFieldName: PARAMS.CONTROL_FIELD_NAME,
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
        );

        await dashboardPage.setupNewLinks({
            linkType: DashRelationTypes.output,
            firstParamName: PARAMS.CONTROL_FIELD_NAME,
            secondParamName: PARAMS.CHART_FIELD,
            widgetElem: selectorElem,
        });

        await selectorElem.click();

        await page.hover(slct(DashCommonQa.RelationsListRow));
        await page.hover(slct(DashCommonQa.RelationsRowPopover));

        await dashboardPage.waitForSelector(
            `${SELECTORS.YC_POPUP} >> text=${PARAMS.RELATION_TYPE_BY_ALIAS}`,
        );

        await dashboardPage.cancelRelationsChanges();
        await dashboardPage.exitEditMode();
    });
    datalensTest(
        'Relation for manual control with same param as in chart',
        async ({page}: {page: Page}) => {
            const workbookPO = new Workbook(page);
            const dashboardPage = new DashboardPage({page});
            await workbookPO.createDashboard({
                editDash: async () => {
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

            const selectorElem = await dashboardPage.getDashControlLinksIconElem(
                ControlQA.controlLinks,
            );

            await selectorElem.click();

            await page.hover(slct(DashCommonQa.RelationsListRow));
            await page.hover(slct(DashCommonQa.RelationsRowPopover));

            await dashboardPage.waitForSelector(
                `${SELECTORS.YC_POPUP} >> text=${PARAMS.RELATION_TEXT}`,
            );

            await dashboardPage.cancelRelationsChanges();
            await dashboardPage.exitEditMode();
        },
    );
    datalensTest('Relation for dataset control', async ({page}: {page: Page}) => {
        const workbookPO = new Workbook(page);
        const dashboardPage = new DashboardPage({page});
        await workbookPO.createDashboard({
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
        await page.hover(slct(DashCommonQa.RelationsRowPopover));

        await dashboardPage.waitForSelector(
            `${SELECTORS.YC_POPUP} >> text=${PARAMS.RELATION_TYPE_BY_FIELD}`,
        );

        await dashboardPage.cancelRelationsChanges();
        await dashboardPage.exitEditMode();
    });
});
