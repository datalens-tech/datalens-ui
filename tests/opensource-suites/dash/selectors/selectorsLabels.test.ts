import {Page} from '@playwright/test';

import DashboardPage, {SelectorSettings} from '../../../page-objects/dashboard/DashboardPage';

import {WorkbooksUrls} from '../../../constants/constants';
import {Workbook} from '../../../page-objects/workbook/Workbook';
import {deleteEntity} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const TITLE = 'City';
const INNER_TITLE = 'innerCity';

const createDashWithSelector = async ({
    page,
    settings,
}: {
    page: Page;
    settings: SelectorSettings;
}) => {
    const dashboardPage = new DashboardPage({page});
    const workbookPO = new Workbook(page);

    await workbookPO.createDashboard({
        editDash: async () => {
            await dashboardPage.addSelectorBySettings({
                ...{
                    appearance: {
                        titleEnabled: true,
                        title: TITLE,
                        innerTitleEnabled: true,
                        innerTitle: INNER_TITLE,
                    },
                    elementType: {innerText: 'List'},
                },
                ...settings,
            });
        },
    });
};

datalensTest.describe('Dashboards are the internal header of selectors', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const workbookPO = new Workbook(page);
        await workbookPO.openE2EWorkbookPage();
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });

    datalensTest(
        'ElementType: Dataset List. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({page, settings: {elementType: {innerText: 'List'}}});

            await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
            await dashboardPage.chartkitControl.expectSelectInnerTitleVisible(INNER_TITLE);
        },
    );

    datalensTest(
        'ElementType: Dataset Input field. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {elementType: {innerText: 'Input field'}},
            });

            await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
            await dashboardPage.chartkitControl.expectInputInnerTitleVisible(INNER_TITLE);
        },
    );

    datalensTest(
        'ElementType: Manual List. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {
                    sourceType: 'manual',
                    fieldName: 'Some name',
                    elementType: {innerText: 'List'},
                },
            });

            await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
            await dashboardPage.chartkitControl.expectSelectInnerTitleVisible(INNER_TITLE);
        },
    );

    datalensTest(
        'ElementType: Manual Input field. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {
                    sourceType: 'manual',
                    fieldName: 'Some name',
                    elementType: {innerText: 'Input field'},
                },
            });

            await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
            await dashboardPage.chartkitControl.expectInputInnerTitleVisible(INNER_TITLE);
        },
    );
});
