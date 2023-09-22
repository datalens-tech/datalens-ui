import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Geo Layers', () => {
    datalensTest(
        'When adding a dataset to an empty chart, the map is displayed correctly',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.Empty);

            await wizardPage.setVisualization(WizardVisualizationId.Geolayer);

            await wizardPage.addFirstDataset(RobotChartsDatasets.GeoDatasetTest);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Geopoint,
                'geopoint',
            );

            await wizardPage.waitForSelector(wizardPage.chartkit.yMapSelector);
        },
    );
});
