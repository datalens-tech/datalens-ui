import {Page, expect} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CommonSelectors} from '../../../page-objects/constants/common-selectors';
import {DialogMetricColorsQa, WizardPageQa, WizardVisualizationId} from '../../../../src/shared';
import {openTestPage, slct} from '../../../utils';
import {CommonUrls} from '../../../page-objects/constants/common-urls';

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

        await wizardPage.metricColorsDialog.open();

        const paletteColor = await wizardPage.metricColorsDialog.getSelectedPaletteColor();
        expect(paletteColor).toBe(defaultColor);
    });

    datalensTest('Size change', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.chartSettings.open();
        await wizardPage.chartSettings.setMetricFontSize('L');

        const apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.chartSettings.apply();
        await (await apiRunRequest).response();

        const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
        const metricItem = chartContainer.locator(wizardPage.chartkit.metricItemSelector);
        const metricItemClassname = await metricItem.getAttribute('class');

        expect(metricItemClassname).toContain('_size_xl');
    });

    datalensTest('Color change by click', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const newColor = '#FF3D64';

        await wizardPage.metricColorsDialog.open();
        await wizardPage.metricColorsDialog.selectColor(newColor);

        const paletteColor = await wizardPage.metricColorsDialog.getSelectedPaletteColor();
        expect(paletteColor).toBe(newColor);

        await wizardPage.metricColorsDialog.apply();

        const indicatorColor = await wizardPage.page
            .locator(wizardPage.chartkit.metricItemValueSelector)
            .evaluate(getElementHexColor);
        expect(indicatorColor).toBe(newColor);
    });

    datalensTest('Color selection from specific palette', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const newPalette = 'Neo 20';
        const expectedColor = '#DB9101'; // first color from Neo 20 palette

        await wizardPage.metricColorsDialog.open();
        await wizardPage.metricColorsDialog.selectPalette(newPalette);

        const paletteColor = await wizardPage.metricColorsDialog.getSelectedPaletteColor();
        expect(paletteColor).toEqual(expectedColor);

        await wizardPage.metricColorsDialog.apply();

        const indicatorColor = await wizardPage.page
            .locator(wizardPage.chartkit.metricItemValueSelector)
            .evaluate(getElementHexColor);
        expect(indicatorColor).toBe(expectedColor);

        await wizardPage.metricColorsDialog.open();
        const selectedPalette = await wizardPage.metricColorsDialog.getSelectedPalette();
        expect(selectedPalette).toBe(newPalette);
    });

    datalensTest('Custom user color', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const inavlidColorValue = 'salmon';
        const customColor = '#FF8C69';

        await wizardPage.metricColorsDialog.open();
        const customColorBtn = page.locator(slct(DialogMetricColorsQa.CustomColorButton));
        await customColorBtn.click();

        const colorInput = wizardPage.metricColorsDialog.getPaletteInput().first();
        await colorInput.fill(inavlidColorValue);

        const colorInputErrorLocator = wizardPage.page.locator(CommonSelectors.TextInputErrorState);

        await expect(colorInputErrorLocator).toBeVisible();

        const validColorValue = customColor.replace('#', '');
        await colorInput.fill(validColorValue);

        await expect(colorInputErrorLocator).not.toBeVisible();

        expect(await wizardPage.metricColorsDialog.getSelectedPaletteColor()).toBe(
            DialogMetricColorsQa.CustomColorButton,
        );

        await wizardPage.metricColorsDialog.apply();

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
