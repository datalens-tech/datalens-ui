import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../../utils/constants';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../../utils';

datalensTest.describe('Wizard - Geo Points', () => {
    datalensTest('Adding a Signature', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({
            page,
        });

        await openTestPage(page, RobotChartsWizardUrls.WizardGeopoints, {
            '93ae409d-2352-43f1-8c21-e29f6321d698': '10267',
        });

        await wizardPage.waitForSelector(wizardPage.chartkit.geopointSelector);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.Labels,
            '_someMeasure',
        );

        try {
            await wizardPage.waitForSelector(`${wizardPage.chartkit.geopointSelector} >> text=10`);
        } catch {
            throw new Error('The dot must have a signature');
        }
    });
});
