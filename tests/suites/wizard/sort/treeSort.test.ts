import {Page, expect} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const sortedValuesAsc = [['2014'], ['Q1'], ['Q2'], ['Q3'], ['Q4'], ['2015'], ['2016'], ['2017']];

const sortedValuesDesc = [['2017'], ['2016'], ['2015'], ['2014'], ['Q4'], ['Q3'], ['Q2'], ['Q1']];

datalensTest.describe('Wizard - Sorting in trees', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.FlatTableWithTree);
    });

    datalensTest('Trees should be sorted by all levels', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const table = wizardPage.chartkit.getTableLocator();
        await table.locator('td', {hasText: '2014'}).click();
        await wizardPage.chartkit.waitUntilLoaderExists();

        let rows = await wizardPage.chartkit.getRowsTexts();

        expect(rows).toStrictEqual(sortedValuesAsc);

        await wizardPage.sectionVisualization.clickOnSortIcon();
        await wizardPage.chartkit.waitUntilLoaderExists();

        rows = await wizardPage.chartkit.getRowsTexts();

        expect(rows).toStrictEqual(sortedValuesDesc);
    });
});
