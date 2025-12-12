import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const TIMEOUT = 3000;

datalensTest.describe('Wizard - Combined diagram. Tooltip', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
    });

    datalensTest(
        'When splitting by color and adding a second layer, the composite name of the line is displayed',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'DATE');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Region');

            await wizardPage.sectionVisualization.addLayer();

            const apiRunRequest = page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'DATE');

            await (await apiRunRequest).response();

            const graph = page.locator(COMMON_CHARTKIT_SELECTORS.chart);
            await graph.waitFor({state: 'visible', timeout: TIMEOUT});

            let attempts = 3;
            let box: {x: number; y: number; width: number; height: number} | null = null;

            while (attempts > 0) {
                box = await graph.boundingBox();
                attempts -= 1;
            }

            if (!box) {
                throw new Error('graph.boundingBox is equal to null');
            }

            await graph.hover();
            await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4);

            await page.waitForSelector(COMMON_CHARTKIT_SELECTORS.tooltipContainer, {
                timeout: TIMEOUT,
            });

            const titles = await page
                .locator(COMMON_CHARTKIT_SELECTORS.tooltipNameColumn)
                .allTextContents();

            expect(titles.map((text) => text.trim())).toEqual([
                'DATE',
                'DATE: West',
                'DATE: East',
                'DATE: Central',
                'DATE: South',
            ]);
        },
    );
});
