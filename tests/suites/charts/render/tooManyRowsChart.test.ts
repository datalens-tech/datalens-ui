import {Page} from '@playwright/test';
import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Chart - chart exceeding the recommended number of rows', () => {
    datalensTest(
        'When you click the "Display" button in the chart exceeding the limits, the chart is loaded',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsWizardUrls.WizardWithOverLimitsChart);

            // click on the 'Display' button
            const showButton = await page.waitForSelector(
                slct(ChartkitMenuDialogsQA.errorButtonRetry),
            );
            await showButton.click();

            // check that the chartkit loaded with the chart
            await page.waitForSelector(`.${COMMON_CHARTKIT_SELECTORS.chartkit}`);
        },
    );
});
