import type {Page} from '@playwright/test';

import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../../utils';
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

        const geoMarker = page.locator(wizardPage.chartkit.geopointSelector).first();
        const tooltip = page.locator(wizardPage.chartkit.tooltipSelector).first();

        await waitForCondition(async () => {
            await page.mouse.move(0, 0);
            await geoMarker.hover({force: true});
            return await tooltip.isVisible();
        }).catch(() => {
            throw new Error('The tooltip did not appear');
        });
    });
});
