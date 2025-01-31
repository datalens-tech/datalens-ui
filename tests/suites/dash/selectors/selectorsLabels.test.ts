import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';

import {getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import {ControlQA} from '../../../../src/shared/constants';
import {COMMON_SELECTORS, RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashTabItemControlSourceType, TitlePlacements} from '../../../../src/shared';

const PARAMS = {
    DATASET: {
        INPUT_TITLE: 'Population',
        SELECT_TITLE: 'City',
        INPUT_INNER_TITLE: 'innerPopulation',
        SELECT_INNER_TITLE: 'innerCity',
        SELECT_TAB: 'DatasetSelect',
        INPUT_TAB: 'DatasetInput',
    },
    MANUAL: {
        INPUT_TITLE: 'CustomInput',
        SELECT_TITLE: 'CustomList',
        INPUT_INNER_TITLE: 'InnerInput',
        SELECT_INNER_TITLE: 'InnerSelect',
        SELECT_TAB: 'ManualSelect',
        INPUT_TAB: 'ManualInput',
    },
    EDITOR: {
        SELECT_INNER_TITLE: 'EditorSelect',
        INPUT_INNER_TITLE: 'EditorInput',
        CONTROL_INPUT_TITLE: 'EditorInputLabel',
        CONTROL_SELECT_TITLE: 'EditorSelectLabel',
        TAB: 'Editor',
    },
};

async function checkLabels(
    dashboardPage: DashboardPage,
    tab: string,
    title: string,
    innerTitle: string,
    innerSelector: string,
    sourceType?: DashTabItemControlSourceType,
) {
    await dashboardPage.changeTab({tabName: tab});
    await dashboardPage.enterEditMode();

    // enable the internal title and title in the selector settings
    await dashboardPage.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_CANCEL_BTN));
    await dashboardPage.clickFirstControlSettingsButton();
    await dashboardPage.controlActions.editSelectorBySettings({
        appearance: {
            title,
            titlePlacement: TitlePlacements.Left,
            innerTitle,
            innerTitleEnabled: true,
        },
        sourceType,
    });
    await dashboardPage.controlActions.applyControlSettings();
    await dashboardPage.saveChanges();

    //checking label
    const selectorControl = await dashboardPage.controlActions.getControlByTitle(title);

    //checking innerLabel
    await selectorControl.waitForSelector(`${innerSelector} >> text=${innerTitle}`);
}

datalensTest.describe('Dashboards - the internal header of selectors', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashName = `e2e-test-dash-selectors-labels-${getUniqueTimestamp()}`;
        const dashboardPage = new DashboardPage({page});
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithSelectors);
        await dashboardPage.copyDashboard(dashName);
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDashFromViewMode();
    });

    datalensTest(
        'The configured headers of the selectors based on the dataset are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await checkLabels(
                dashboardPage,
                PARAMS.DATASET.SELECT_TAB,
                PARAMS.DATASET.SELECT_TITLE,
                PARAMS.DATASET.SELECT_INNER_TITLE,
                `${slct(ControlQA.controlSelect)} > span`,
                DashTabItemControlSourceType.Dataset,
            );

            await checkLabels(
                dashboardPage,
                PARAMS.DATASET.INPUT_TAB,
                PARAMS.DATASET.INPUT_TITLE,
                PARAMS.DATASET.INPUT_INNER_TITLE,
                `${slct(ControlQA.controlInput)} label`,
                DashTabItemControlSourceType.Dataset,
            );
        },
    );
    datalensTest(
        'Configured headers for selectors with manual input are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await checkLabels(
                dashboardPage,
                PARAMS.MANUAL.SELECT_TAB,
                PARAMS.MANUAL.SELECT_TITLE,
                PARAMS.MANUAL.SELECT_INNER_TITLE,
                `${slct(ControlQA.controlSelect)} > span`,
            );

            await checkLabels(
                dashboardPage,
                PARAMS.MANUAL.INPUT_TAB,
                PARAMS.MANUAL.INPUT_TITLE,
                PARAMS.MANUAL.INPUT_INNER_TITLE,
                `${slct(ControlQA.controlInput)} label`,
            );
        },
    );
    datalensTest(
        'The configured headers of the editorial selectors are displayed on the dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.changeTab({tabName: PARAMS.EDITOR.TAB});

            // checking that input and select labels exist
            await dashboardPage.waitForSelector(
                slct(ControlQA.controlLabel, PARAMS.EDITOR.CONTROL_INPUT_TITLE),
            );
            await dashboardPage.waitForSelector(
                slct(ControlQA.controlLabel, PARAMS.EDITOR.CONTROL_SELECT_TITLE),
            );

            // checking the existence of innerLabel at the input
            await dashboardPage.waitForSelector(
                `${slct(ControlQA.controlInput)} label >> text=${PARAMS.EDITOR.INPUT_INNER_TITLE}`,
            );

            // checking the existence of innerLabel in a select
            await dashboardPage.waitForSelector(
                `${slct(ControlQA.controlSelect)} > span >> text=${
                    PARAMS.EDITOR.SELECT_INNER_TITLE
                }`,
            );
        },
    );
});
