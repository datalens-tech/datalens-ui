import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const addFilter = async (
    wizardPage: WizardPage,
    placeholderName: PlaceholderName,
    values: string[],
) => {
    await wizardPage.sectionVisualization.addFieldByClick(placeholderName, 'location');

    await wizardPage.filterEditor.selectValues(values);

    await wizardPage.filterEditor.apply();
};

const location_1 = ['10267'];

const location_2 = ['10271'];

const commonFilters = [...location_1, ...location_2];

datalensTest.describe('Wizard layer filters', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForGeoDataset);

        await wizardPage.setVisualization(WizardVisualizationId.Geolayer);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Geopoint, 'geopoint');

        await addFilter(wizardPage, PlaceholderName.Filters, commonFilters);

        await waitForCondition(async () => {
            const geopoints = await page.$$(wizardPage.chartkit.geopointSelector);

            return geopoints.length === 2;
        });
    });

    datalensTest(
        'The user can set several identical filters for one field',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await addFilter(wizardPage, PlaceholderName.LayerFilters, location_1);

            await addFilter(wizardPage, PlaceholderName.LayerFilters, location_1);

            await waitForCondition(async () => {
                const geopoints = await page.$$(wizardPage.chartkit.geopointSelector);

                return geopoints.length === 1;
            });
        },
    );

    datalensTest(
        'A user can set several mutually exclusive filters for one field and get the error "No data"',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await addFilter(wizardPage, PlaceholderName.LayerFilters, location_1);

            await addFilter(wizardPage, PlaceholderName.LayerFilters, location_2);

            await wizardPage.chartkit.waitForErrorTitle('ERR.CK.NO_DATA');
        },
    );
});
