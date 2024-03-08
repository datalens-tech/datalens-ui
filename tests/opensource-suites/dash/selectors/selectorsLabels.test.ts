import {Page} from '@playwright/test';

import DashboardPage, {SelectorSettings} from '../../../page-objects/dashboard/DashboardPage';

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
    });
};

datalensTest.describe('Dashboards - The internal header of selectors', () => {
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash();
    });

    datalensTest(
        'ElementType: Dataset List. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {elementType: {innerText: 'List'}},
            });

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
