import {Page, expect} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CommonQa} from '../../../page-objects/constants/common-selectors';
import {DialogMetricSettingsQa, WizardPageQa, WizardVisualizationId} from '../../../../src/shared';
import {openTestPage, slct} from '../../../utils';

datalensTest.describe('Wizard - metric chart. Settings', () => {
    const defaultColor = '#4DA2F1';

    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.setVisualization(WizardVisualizationId.Metric);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'City');

        const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
        const chart = chartContainer.locator(wizardPage.chartkit.metricItemSelector);

        await expect(chart).toBeVisible();
    });

    datalensTest('Default values', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.metricSettingsDialog.open();

        const paletteColor = await wizardPage.metricSettingsDialog.getSelectedPaletteColor();
        expect(paletteColor).toBe(defaultColor);
    });

    datalensTest('Size change', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.metricSettingsDialog.open();
        await wizardPage.metricSettingsDialog.selectSize('L');
        await wizardPage.metricSettingsDialog.apply();

        const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
        const metricItem = chartContainer.locator(wizardPage.chartkit.metricItemSelector);
        const metricItemClassname = await metricItem.getAttribute('class');

        expect(metricItemClassname).toContain('_size_xl');
    });

    datalensTest('Color change by click', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const newColor = '#FF3D64';

        await wizardPage.metricSettingsDialog.open();
        await wizardPage.metricSettingsDialog.selectColor(newColor);

        const paletteColor = await wizardPage.metricSettingsDialog.getSelectedPaletteColor();
        expect(paletteColor).toBe(newColor);

        await wizardPage.metricSettingsDialog.apply();

        const indicatorColor = await wizardPage.page
            .locator(wizardPage.chartkit.metricItemValueSelector)
            .evaluate(getElementHexColor);
        expect(indicatorColor).toBe(newColor);
    });

    datalensTest('Color selection from specific palette', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const newPalette = 'Neo 20';
        const expectedColor = '#DB9101'; // first color from Neo 20 palette

        await wizardPage.metricSettingsDialog.open();
        await wizardPage.metricSettingsDialog.selectPalette(newPalette);

        const paletteColor = await wizardPage.metricSettingsDialog.getSelectedPaletteColor();
        expect(paletteColor).toEqual(expectedColor);

        await wizardPage.metricSettingsDialog.apply();

        const indicatorColor = await wizardPage.page
            .locator(wizardPage.chartkit.metricItemValueSelector)
            .evaluate(getElementHexColor);
        expect(indicatorColor).toBe(expectedColor);

        await wizardPage.metricSettingsDialog.open();
        const selectedPalette = await wizardPage.metricSettingsDialog.getSelectedPalette();
        expect(selectedPalette).toBe(newPalette);
    });

    datalensTest('Custom user color', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const inavlidColorValue = 'salmon';
        const customColor = '#FF8C69';

        await wizardPage.metricSettingsDialog.open();
        const customColorBtn = page.locator(slct(DialogMetricSettingsQa.CustomColorButton));
        await customColorBtn.click();

        const colorInput = wizardPage.metricSettingsDialog.getPaletteInput();
        await colorInput.fill(inavlidColorValue);

        const colorInputErrorLocator = wizardPage.page.locator(slct(CommonQa.ControlErrorMessage));

        const errorMessage = await colorInputErrorLocator.textContent();
        expect(errorMessage).toBeTruthy();

        const validColorValue = customColor.replace('#', '');
        await colorInput.fill(validColorValue);

        await expect(colorInputErrorLocator).not.toBeVisible();

        expect(await wizardPage.metricSettingsDialog.getSelectedPaletteColor()).toBe(
            DialogMetricSettingsQa.CustomColorButton,
        );

        await wizardPage.metricSettingsDialog.apply();

        const indicatorColor = await wizardPage.page
            .locator(wizardPage.chartkit.metricItemValueSelector)
            .evaluate(getElementHexColor);
        expect(indicatorColor).toBe(customColor);
    });
});

function getElementHexColor(element: HTMLElement) {
    const rgbColor = element.style.color;

    if (!rgbColor) {
        return rgbColor;
    }

    const [r, g, b] = rgbColor.slice(4, -1).split(',');
    const hexColor =
        // eslint-disable-next-line no-bitwise
        '#' + ((1 << 24) | (Number(r) << 16) | (Number(g) << 8) | Number(b)).toString(16).slice(1);

    return hexColor.toUpperCase();
}
