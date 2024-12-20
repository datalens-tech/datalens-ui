import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashTabItemControlSourceType, TitlePlacements} from '../../../../src/shared';
import {
    SelectorElementType,
    type SelectorSettings,
} from '../../../page-objects/dashboard/ControlActions';

const TITLE = 'City';
const INNER_TITLE = 'innerCity';

const createDashWithSelector = async ({
    page,
    settings = {},
}: {
    page: Page;
    settings?: SelectorSettings;
}) => {
    const dashboardPage = new DashboardPage({page});

    await dashboardPage.createDashboard({
        editDash: async () => {
            await dashboardPage.controlActions.addSelectorWithDefaultSettings({
                ...{
                    appearance: {
                        titlePlacement: TitlePlacements.Left,
                        title: TITLE,
                        innerTitleEnabled: true,
                        innerTitle: INNER_TITLE,
                    },
                },
                ...settings,
            });
        },
    });
};

const checkLabels = async (dashboardPage: DashboardPage, type: 'select' | 'input') => {
    if (type === 'select') {
        await dashboardPage.chartkitControl.expectSelectInnerTitleVisible(INNER_TITLE);
    } else {
        await dashboardPage.chartkitControl.expectInputInnerTitleVisible(INNER_TITLE);
    }

    await dashboardPage.chartkitControl.expectTitleVisible(TITLE);
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
            });

            await checkLabels(dashboardPage, 'select');
        },
    );

    datalensTest(
        'ElementType: Dataset Input field. The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {elementType: SelectorElementType.Input},
            });

            await checkLabels(dashboardPage, 'input');
        },
    );

    datalensTest(
        'ElementType: Manual List. The configured headers of the manual selectors are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {
                    sourceType: DashTabItemControlSourceType.Manual,
                    fieldName: 'Some name',
                },
            });

            await checkLabels(dashboardPage, 'select');
        },
    );

    datalensTest(
        'ElementType: Manual Input field. The configured headers of the manual selectors are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await createDashWithSelector({
                page,
                settings: {
                    sourceType: DashTabItemControlSourceType.Manual,
                    fieldName: 'Some name',
                    elementType: SelectorElementType.Input,
                },
            });

            await checkLabels(dashboardPage, 'input');
        },
    );
});
