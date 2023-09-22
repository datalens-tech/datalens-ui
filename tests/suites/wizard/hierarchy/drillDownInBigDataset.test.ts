import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard Hierarchy', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const hierarchyName = 'Hierarchy for detail';

        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForBigDataset);

        await wizardPage.setVisualization(WizardVisualizationId.Column);

        await wizardPage.openHierarchyEditor();

        await wizardPage.hierarchyEditor.setName(hierarchyName);

        await wizardPage.hierarchyEditor.selectFields(['action', 'actor_login']);

        await wizardPage.hierarchyEditor.clickSave();

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, hierarchyName);
    });

    datalensTest(
        'The user tries to fail to a level where there is too much data, gets an error and returns back',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.chartkit.drillDown();

            await wizardPage.chartkit.waitForErrorTitle('ERR.CHARTS.ROWS_NUMBER_OVERSIZE');

            await wizardPage.chartkit.drillUp();

            await wizardPage.chartkit.waitForSuccessfulRender();
        },
    );
});
