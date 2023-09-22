import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {GeopointType, PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

async function prepareGeoPointWizard(page: Page) {
    const wizardPage = new WizardPage({page});

    await openTestPage(page, RobotChartsWizardUrls.WizardForGeoDataset);

    await wizardPage.setVisualization(WizardVisualizationId.Geolayer);
}

async function checkColorLegend(
    wizardPage: WizardPage,
    geopointType: GeopointType.Geopoligons | GeopointType.Geopoints,
) {
    await wizardPage.sectionVisualization.setGeotype(geopointType);

    const fieldName = {
        [GeopointType.Geopoints]: 'geopoint',
        [GeopointType.Geopoligons]: 'polygon6',
    }[geopointType];

    const placeholderName = {
        [GeopointType.Geopoints]: PlaceholderName.Geopoint,
        [GeopointType.Geopoligons]: PlaceholderName.Geopoligon,
    }[geopointType];

    await wizardPage.sectionVisualization.addFieldByClick(placeholderName, fieldName);

    await waitForCondition(async () => {
        return !(await wizardPage.chartkit.getLayerLegend());
    });

    await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'location');

    await waitForCondition(async () => {
        return Boolean(await wizardPage.chartkit.getLayerLegend());
    });

    await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.Colors, 'location');

    await waitForCondition(async () => {
        return !(await wizardPage.chartkit.getLayerLegend());
    });
}

datalensTest.describe('Wizard - Geo Layers', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await prepareGeoPointWizard(page);
    });

    datalensTest(
        'Geo points: when adding colors, a legend should appear on the chart',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await checkColorLegend(wizardPage, GeopointType.Geopoints);
        },
    );

    datalensTest(
        'Geopolygons: when adding colors, a legend should appear on the chart',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await checkColorLegend(wizardPage, GeopointType.Geopoligons);
        },
    );

    datalensTest(
        'Geotocs (heat map): the legend appears on the map immediately after adding the geo points',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.setGeotype(GeopointType.GeopointsHeatMap);

            await waitForCondition(async () => {
                return !(await wizardPage.chartkit.getLayerLegend());
            });

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Heatmap,
                'geopoint',
            );

            await waitForCondition(async () => {
                return Boolean(await wizardPage.chartkit.getLayerLegend());
            });
        },
    );
});
