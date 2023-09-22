import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {ChartSettingsItems} from '../../../page-objects/wizard/ChartSettings';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Chartkit', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.sectionVisualization.addFieldByDragAndDrop(
            PlaceholderName.FlatTableColumns,
            'Category',
        );

        await wizardPage.sectionVisualization.addFieldByDragAndDrop(
            PlaceholderName.FlatTableColumns,
            'Profit',
        );
    });

    datalensTest('Exporting flat table data', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.chartkit.waitForSuccessfulRender();

        try {
            await wizardPage.chartkit.exportCsv();
        } catch {
            throw new Error("Can't export data via charkit!");
        }
    });

    datalensTest('Exporting flat table data with totals enabled', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.chartSettings.open();

        await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Totals, 'on');

        await wizardPage.chartSettings.apply();

        await wizardPage.chartkit.waitForSuccessfulRender();

        try {
            await wizardPage.chartkit.exportCsv();
        } catch {
            throw new Error("Can't export data via charkit!");
        }
    });
});
