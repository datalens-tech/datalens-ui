import {expect} from '@playwright/test';

import QLPage from '../../../../page-objects/ql/QLPage';
import {openTestPage} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('QL', () => {
    datalensTest.describe('Pie chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.ql.urls.NewQLChartWithConnection);

            const qlPage = new QLPage({page});
            await qlPage.setVisualization(WizardVisualizationId.PieD3);
            await qlPage.setScript(config.ql.queries.citySales);
            await qlPage.runScript();
        });

        datalensTest('"Column names" in Labels section @screenshot', async ({page}) => {
            const qlPage = new QLPage({page});
            const previewLoader = page.locator('.grid-loader');
            const chart = page.locator('.chartkit-graph,.gcharts-d3');

            await qlPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'city');
            await expect(previewLoader).not.toBeVisible();
            const labelsWithColorFieldScreenshot = await chart.screenshot();

            await qlPage.sectionVisualization.removeFieldByClick(PlaceholderName.Labels, 'city');
            await qlPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Labels,
                'Column Names',
            );
            await expect(previewLoader).not.toBeVisible();
            // @ts-ignore
            // The labels for "Column Names" must match the labels for the field in the Colors section
            await expect(await chart.screenshot()).toMatchSnapshot(labelsWithColorFieldScreenshot);
        });
    });
});
