import {expect, Response} from '@playwright/test';
import get from 'lodash/get';
import {
    ChartKitQa,
    PlaceholderId,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {CommonUrls} from '../../../../page-objects/constants/common-urls';
import {RadioButtons, RadioButtonsValues} from '../../../../page-objects/wizard/PlaceholderDialog';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

const mapDataKeyToValue = {
    'xAxis.type': 'datetime',
    'xAxis.grid.enabled': false,
};

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Combined chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
        });

        datalensTest(
            'X axis settings should be applied correctly when first layer is empty',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = preview.locator(slct(ChartKitQa.Loader));
                const responses: Response[] = [];
                const onResponse = (response: Response) => {
                    const responseUrl = new URL(response.url());

                    if (responseUrl.pathname === CommonUrls.ApiRun && response.ok()) {
                        responses.push(response);
                    }
                };

                page.on('response', onResponse);

                await wizardPage.sectionVisualization.addLayer();
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'Order_date',
                );
                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
                await wizardPage.placeholderDialog.open(PlaceholderId.X);
                await wizardPage.placeholderDialog.toggleRadioButton(
                    RadioButtons.Grid,
                    RadioButtonsValues.Off,
                );
                await wizardPage.placeholderDialog.apply();

                await expect(previewLoader).not.toBeVisible();

                page.off('response', onResponse);

                const lastResponse = responses[responses.length - 1];
                expect(lastResponse).toBeDefined();

                const responseData = await lastResponse.json();
                Object.entries(mapDataKeyToValue).forEach(([key, value]) => {
                    expect(get(responseData?.data, key)).toBe(value);
                });
            },
        );
    });
});
