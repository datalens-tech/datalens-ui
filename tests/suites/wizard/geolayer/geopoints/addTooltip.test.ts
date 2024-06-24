import type {Page} from '@playwright/test';
import {expect} from '@playwright/test';

import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage} from '../../../../utils';
import {RobotChartsWizardUrls} from '../../../../utils/constants';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - Geo Points', () => {
    datalensTest('Tooltip appearance', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({
            page,
        });

        await openTestPage(page, RobotChartsWizardUrls.WizardGeopoints, {
            '93ae409d-2352-43f1-8c21-e29f6321d698': '10267',
        });

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.Tooltips,
            '_someMeasure',
        );

        await wizardPage.chartkit.waitForMapReady();

        const geoMarker = page.locator(wizardPage.chartkit.geopointSelector);
        await geoMarker.hover({force: true});

        const tooltip = page.locator(wizardPage.chartkit.tooltipSelector).first();
        await expect(tooltip).toBeVisible();
    });
});
