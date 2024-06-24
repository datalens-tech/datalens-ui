import {expect, Page} from '@playwright/test';

import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage} from '../../../../utils';
import {RobotChartsWizardUrls} from '../../../../utils/constants';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - Geo Points', () => {
    datalensTest('Adding Size', async ({page}: {page: Page}) => {
        const defaultPointSize = '14px';

        const wizardPage = new WizardPage({page});
        await openTestPage(page, RobotChartsWizardUrls.WizardGeopoints);

        const point = page.locator(wizardPage.chartkit.geopointSelector).first();
        await expect(point).toHaveCSS('height', defaultPointSize);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Size, '_someMeasure');
        await expect(point).not.toHaveCSS('height', defaultPointSize);
    });
});
