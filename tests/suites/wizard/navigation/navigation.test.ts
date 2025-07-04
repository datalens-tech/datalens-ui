import {Page} from '@playwright/test';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ActionPanelQA, DlNavigationQA} from '../../../../src/shared/constants';

const PARAMS = {
    FOLDER_NAME: 'E2E_NAVIGATION_TEST',
};

datalensTest.describe('Wizard - Navigation', () => {
    datalensTest(
        'When you click on a bread crumb, navigation in the corresponding directory should open',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsWizardUrls.NewChartWithCurrentPath);
            await page.locator(slct(ActionPanelQA.EntryBreadcrumbs)).getByText('yagr').click();

            const breadcrumbs = page
                .locator(slct(DlNavigationQA.NavigationBreadcrumbs))
                .getByRole('link');
            await expect(breadcrumbs).toHaveText(['Все объекты', 'Users', 'robot-charts', 'yagr'], {
                useInnerText: true,
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
