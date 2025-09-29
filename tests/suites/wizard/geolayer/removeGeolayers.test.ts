import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Geo Layers', () => {
    datalensTest('Deleting a geo layer', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForGeoDataset);

        await wizardPage.setVisualization(WizardVisualizationId.Geolayer);

        await wizardPage.sectionVisualization.addLayer();

        await wizardPage.sectionVisualization.toggleLayerList();

        await wizardPage.sectionVisualization.waitForLayers([
            'geolayer-select-layer-1',
            'geolayer-select-layer-0',
        ]);

        await wizardPage.sectionVisualization.removeGeoLayer('geolayer-select-layer-0');

        await wizardPage.sectionVisualization.toggleLayerList();
        await wizardPage.sectionVisualization.expectLayersSelectItemsCount(1);
    });
});
