import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {GeopointType, PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DialogFieldAggregationSelectorValuesQa} from '../../../../src/shared';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Geo Layers', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForGeoDataset);

        await wizardPage.setVisualization(WizardVisualizationId.Geolayer);
    });

    datalensTest(
        'Creating two geo layers for a point map, new layers are added to the beginning of the geo layer selection',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Geopoint,
                'geopoint',
            );

            await wizardPage.sectionVisualization.addLayer();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Geopoint,
                'geopoint',
            );

            await wizardPage.sectionVisualization.toggleLayerList();

            await wizardPage.sectionVisualization.waitForLayers([
                'geolayer-select-layer-1',
                'geolayer-select-layer-0',
            ]);
        },
    );

    datalensTest(
        'Creating two geo layers with local fields, the chart should not lose information about the local field',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'lon');

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Colors, 'lon');

            await wizardPage.visualizationItemDialog.setAggregation(
                DialogFieldAggregationSelectorValuesQa.Countuniqe,
            );

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            const successfulResponsePromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Geopoint,
                'geopoint',
            );

            await successfulResponsePromise;

            await wizardPage.chartkit.waitUntilLoaderExists();

            await wizardPage.sectionVisualization.addLayer();

            await wizardPage.chartkit.waitUntilLoaderExists();

            await wizardPage.sectionVisualization.setGeotype(GeopointType.Geopoligons);

            await wizardPage.chartkit.waitUntilLoaderExists();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Geopoligon,
                'polygon6',
            );

            await wizardPage.chartkit.waitUntilLoaderExists();

            await wizardPage.waitForSelector(wizardPage.chartkit.yMapSelector);
        },
    );
});
