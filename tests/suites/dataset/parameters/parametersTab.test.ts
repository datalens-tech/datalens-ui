import {Page, expect} from '@playwright/test';
import {ParametersQA} from '../../../../src/shared/constants';

import {openTestPage, slct} from '../../../utils';
import {RobotChartsDatasetUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CommonSelectors} from '../../../page-objects/constants/common-selectors';

async function goToParametersTab(page: Page) {
    await page.click(
        `.dataset-panel .g-segmented-radio-group__option ${CommonSelectors.RadioButtonOptionControl}[value=parameters]`,
        {
            force: true,
        },
    );

    const parametersTabSection = page.locator(slct(ParametersQA.ParametersTabSection));

    await expect(parametersTabSection).toBeVisible();
}

datalensTest.describe('Datasets - Tab parameters', () => {
    datalensTest(
        'The parameters tab is available during dataset creation',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDatasetUrls.NewDataset);

            const parametersTab = page.locator(
                `.dataset-panel .g-segmented-radio-group__option ${CommonSelectors.RadioButtonOptionControl}[value=parameters]`,
            );

            await expect(parametersTab).not.toBeDisabled();

            await goToParametersTab(page);
        },
    );

    datalensTest(
        'Tab with parameters is available when the dataset has already been created',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters);

            await goToParametersTab(page);
        },
    );
});
