import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, waitForCondition} from '../../../utils';

datalensTest.describe('Wizard - Geo Layers', () => {
    datalensTest('Renaming two geo layers', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForGeoDataset);

        await wizardPage.setVisualization(WizardVisualizationId.Geolayer);

        await wizardPage.sectionVisualization.addLayer();

        await wizardPage.sectionVisualization.openLayerList();

        const updatedFirstLayerName = 'Renamed Geo layer 1';
        const updatedSecondLayerName = 'Renamed Geo layer 2';

        await wizardPage.sectionVisualization.renameGeoLayer(
            'geolayer-select-layer-1',
            updatedFirstLayerName,
        );

        await wizardPage.sectionVisualization.waitForLayers([
            'geolayer-select-layer-1',
            'geolayer-select-layer-0',
        ]);

        await wizardPage.sectionVisualization.renameGeoLayer(
            'geolayer-select-layer-0',
            updatedSecondLayerName,
        );

        await waitForCondition(async () => {
            const items = await wizardPage.sectionVisualization.getLayersSelectItems();

            const texts = await Promise.all(items.map((item) => item.innerText()));

            return texts.join(',') === [updatedFirstLayerName, updatedSecondLayerName].join(',');
        });
    });
});
