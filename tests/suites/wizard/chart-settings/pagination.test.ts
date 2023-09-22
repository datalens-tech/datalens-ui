import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const rowLimit = 10;

datalensTest.describe('Wizard - Chart Settings', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.Empty);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.addFirstDataset(RobotChartsDatasets.CitiesDataset);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'City',
        );

        await wizardPage.chartSettings.open();

        expect(await wizardPage.chartSettings.isPaginationSwitcherDisabled()).toEqual(false);

        await wizardPage.chartSettings.setLimit(rowLimit);

        await wizardPage.chartSettings.apply();
    });

    datalensTest(
        'When adding a second dataset, the ability to edit pagination in the settings is disabled',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.addAdditionalDataset(RobotChartsDatasets.GeoDatasetTest);

            await wizardPage.chartSettings.open();

            expect(await wizardPage.chartSettings.isPaginationSwitcherDisabled()).toEqual(true);
        },
    );

    datalensTest(
        'When adding a second dataset, pagination in the chart should disappear',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await waitForCondition(async () => {
                return (await wizardPage.chartkit.getTableRowsCount()) === rowLimit;
            });

            await wizardPage.chartkit.waitForPaginationExist();

            await wizardPage.addAdditionalDataset(RobotChartsDatasets.GeoDatasetTest);

            await waitForCondition(async () => {
                return (await wizardPage.chartkit.getTableRowsCount()) > rowLimit;
            });

            await wizardPage.chartkit.waitForPaginationNotExist();
        },
    );
});
