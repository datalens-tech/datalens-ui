import {Page} from '@playwright/test';
import {ChartkitMenuDialogsQA, ControlQA} from '../../../../src/shared/constants';

import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    SELECTOR_PARAM_VALUE: '100',
    IGNORE_PARAM_CHART_TAB: 'chart2',
};

const chartkitControlInput = `${slct(ControlQA.chartkitControl)} input`;

datalensTest.describe('Dashboards - Links', () => {
    datalensTest(
        'The influencing parameters of one chart tab do not affect the chart tab with ignoring these parameters',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            // dashboard with a chart that has the same charts in two tabs
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartTabsAndRelation);

            // looking for a selector and entering a value that is not on the chart
            // note: it works unstable with fill, had to be replaced with type
            await page.type(chartkitControlInput, PARAMS.SELECTOR_PARAM_VALUE);

            // note: it works unstable with click, had to be replaced with press enter
            await page.press(chartkitControlInput, 'Enter');

            // checking the missing data error
            await page.waitForSelector(slct(ChartkitMenuDialogsQA.chartError));

            // switch to another chart tab
            const widgetTab = await page.waitForSelector(
                slct(ChartkitMenuDialogsQA.widgetTab, PARAMS.IGNORE_PARAM_CHART_TAB),
            );
            await widgetTab.click();

            // check that there is a chart in the chart without the influence of the parameter inside the chart, and not an error
            await dashboardPage.waitForSelector(`.${COMMON_CHARTKIT_SELECTORS.chartkit}`);
        },
    );
});
