import {Page} from '@playwright/test';

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

        await wizardPage.waitForSelector(wizardPage.chartkit.geopointSelector);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.Tooltips,
            '_someMeasure',
        );

        await waitForCondition(async () => {
            const point = await wizardPage.waitForSelector(wizardPage.chartkit.geopointSelector);

            await point.hover({force: true});

            return (await page.$$(wizardPage.chartkit.tooltipSelector)).length > 0;
        }).catch(() => {
            throw new Error('The tooltip did not appear');
        });
    });
});
