import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {getStylesFromString, openTestPage} from '../../../../utils';
import {RobotChartsWizardUrls} from '../../../../utils/constants';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - Geo Points', () => {
    datalensTest('Adding Size', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({
            page,
        });

        await openTestPage(page, RobotChartsWizardUrls.WizardGeopoints);

        let point = await page.waitForSelector(wizardPage.chartkit.geopointSelector);
        let styleAttr = await point?.getAttribute('style');
        const sizeBeforeDimension = getStylesFromString(styleAttr || '').height;

        if (!sizeBeforeDimension) {
            throw new Error("Couldn't get the point size BEFORE setting the size");
        }

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Size, '_someMeasure');

        await wizardPage.chartkit.waitForMapReady();

        point = await page.waitForSelector(wizardPage.chartkit.geopointSelector);
        styleAttr = await point?.getAttribute('style');
        const sizeAfterDimension = getStylesFromString(styleAttr || '').height;

        if (!sizeAfterDimension) {
            throw new Error("Couldn't get the point size AFTER setting the size");
        }

        expect(sizeBeforeDimension).not.toEqual(sizeAfterDimension);
    });
});
