import {Page} from '@playwright/test';

import DashboardPage, {SelectorSettings} from '../../../page-objects/dashboard/DashboardPage';

import {WorkbooksUrls} from '../../../constants/constants';
import {deleteEntity} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {TestParametrizationConfig} from '../../../types/config';

const TITLE = 'City';
const INNER_TITLE = 'innerCity';

const createDashWithSelector = async ({
    page,
    settings,
    config,
}: {
    page: Page;
    settings: SelectorSettings;
    config: TestParametrizationConfig;
}) => {
    const dashboardPage = new DashboardPage({page});

    await dashboardPage.createDashboard({
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
        createDashUrl: config.dash.endpoints.createDash,
    });
};

datalensTest.describe('Dashboards are the internal header of selectors', () => {
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });

    datalensTest(
        'ElementType: Dataset List. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {elementType: {innerText: 'List'}},
                config,
            });

            await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
            await dashboardPage.chartkitControl.expectSelectInnerTitleVisible(INNER_TITLE);
        },
    );

    datalensTest(
        'ElementType: Dataset Input field. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {elementType: {innerText: 'Input field'}},
                config,
            });

            await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
            await dashboardPage.chartkitControl.expectInputInnerTitleVisible(INNER_TITLE);
        },
    );

    datalensTest(
        'ElementType: Manual List. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {
                    sourceType: 'manual',
                    fieldName: 'Some name',
                    elementType: {innerText: 'List'},
                },
                config,
            });

            await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
            await dashboardPage.chartkitControl.expectSelectInnerTitleVisible(INNER_TITLE);
        },
    );

    datalensTest(
        'ElementType: Manual Input field. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {
                    sourceType: 'manual',
                    fieldName: 'Some name',
                    elementType: {innerText: 'Input field'},
                },
                config,
            });

            await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
            await dashboardPage.chartkitControl.expectInputInnerTitleVisible(INNER_TITLE);
        },
    );
});
