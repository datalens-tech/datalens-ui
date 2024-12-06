import {expect} from '@playwright/test';

import QLPage from '../../../../page-objects/ql/QLPage';
import {openTestPage} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {AxisMode} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {
    PlaceholderId,
    RadioButtons,
    RadioButtonsValues,
} from '../../../../page-objects/wizard/PlaceholderDialog';

datalensTest.describe('QL', () => {
    datalensTest.describe('Column chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.ql.urls.NewQLChartWithConnection);

            const qlPage = new QLPage({page});

            await qlPage.setScript(config.ql.queries.dateAndSales);
            await qlPage.runScript();
        });

        datalensTest(
            'Check that fields order does not affect axis settings @screenshot',
            async ({page, config}) => {
                const qlPage = new QLPage({page});

                const previewLoader = page.locator('.grid-loader');
                const chart = page.locator('.chartkit-graph,.gcharts-d3');

                await qlPage.sectionVisualization.removeFieldByClick(
                    PlaceholderName.X,
                    'Column Names',
                );
                await qlPage.sectionVisualization.removeFieldByClick(
                    PlaceholderName.Y,
                    'date_year',
                );
                await qlPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'date_year');

                await expect(previewLoader).not.toBeVisible();

                await qlPage.placeholderDialog.open(PlaceholderId.X);

                const selectedMode = await qlPage.placeholderDialog.getRadioButtonsSelectedValue(
                    RadioButtons.AxisMode,
                );

                expect(selectedMode).toEqual(AxisMode.Continuous);

                await qlPage.placeholderDialog.toggleRadioButton(
                    RadioButtons.AxisMode,
                    RadioButtonsValues.Discrete,
                );

                await qlPage.placeholderDialog.apply();

                await expect(previewLoader).not.toBeVisible();

                const discreteXAxisScreenshot = await chart.screenshot();

                await qlPage.clearScript();
                await qlPage.setScript(config.ql.queries.dateAndSalesModified);

                await qlPage.runScript();

                await expect(previewLoader).not.toBeVisible();

                await qlPage.sectionVisualization.removeFieldByClick(PlaceholderName.Y, 'sales');
                await qlPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'average_sales',
                );

                await expect(previewLoader).not.toBeVisible();

                await qlPage.placeholderDialog.open(PlaceholderId.X);

                const selectedModeAfterModify =
                    await qlPage.placeholderDialog.getRadioButtonsSelectedValue(
                        RadioButtons.AxisMode,
                    );

                expect(selectedModeAfterModify).toEqual(AxisMode.Discrete);

                await qlPage.placeholderDialog.close();

                // @ts-ignore
                // X axis should stay discrete after changing the query
                await expect(await chart.screenshot()).toMatchSnapshot(discreteXAxisScreenshot);
            },
        );
    });
});
