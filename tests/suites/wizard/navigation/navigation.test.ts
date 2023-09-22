import {Page} from '@playwright/test';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ActionPanelQA} from '../../../../src/shared/constants';

const coreBreadrumbSelector = '.dl-core-navigation-breadcrumbs__item';

const PARAMS = {
    FOLDER_NAME: 'E2E_NAVIGATION_TEST',
};

async function getCoreNavigationBreadcrumbs(page: Page) {
    await page.waitForSelector(coreBreadrumbSelector);

    const items = await page.$$(coreBreadrumbSelector);

    return Promise.all(items.map((item) => item.getAttribute('data-qa')));
}

async function clickToNavigationBreadcrumb(page: Page, breadcrumb: string) {
    await page.click(`.yc-breadcrumbs__item >> text=${breadcrumb}`);
}

datalensTest.describe('Wizard - Navigation', () => {
    datalensTest(
        'When you click on a bread crumb, navigation in the corresponding directory should open',
        async ({page}: {page: Page}) => {
            const expectedRobotChartsBreadcrumbs = [
                'breadcrumbs-item-root',
                'breadcrumbs-item-Users',
                'breadcrumbs-item-robot-charts',
                'breadcrumbs-item-yagr',
            ];

            let texts: (string | null)[] = [];

            await openTestPage(page, RobotChartsWizardUrls.NewChartWithCurrentPath);

            await clickToNavigationBreadcrumb(page, 'yagr');

            await waitForCondition(async () => {
                texts = await getCoreNavigationBreadcrumbs(page);

                return texts.join() === expectedRobotChartsBreadcrumbs.join();
            }).catch(() => {
                expect(texts).toEqual(expectedRobotChartsBreadcrumbs);
            });
        },
    );

    datalensTest(
        'When you try to create a chart, you will be prompted to create it along the path specified in currentPath',
        async ({page}: {page: Page}) => {
            const expectedPath = 'yagr';

            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForCsvBasedDatasetWithCurrentPath);

            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'City',
            );

            let text: string;

            await waitForCondition(async () => {
                text = await wizardPage.openSaveDialogAndGetPath();

                return text === expectedPath;
            }).catch(() => {
                expect(text).toEqual(expectedPath);
            });
        },
    );

    datalensTest(
        'When trying to save a chart with the choice of an arbitrary folder in the navigation, the chart is saved successfully',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForCsvBasedDataset);

            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'City',
            );

            const entryName = 'e2e-test-wizard-chart-navigation';

            await wizardPage.saveInFolder(
                PARAMS.FOLDER_NAME,
                wizardPage.getUniqueEntryName(entryName),
            );

            await wizardPage.waitForSelector(
                `${slct(ActionPanelQA.ActionPanel)} >> text=${PARAMS.FOLDER_NAME}`,
            );

            await wizardPage.deleteEntry();
        },
    );
});
