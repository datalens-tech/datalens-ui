import {Page} from '@playwright/test';
import {DialogColorQa, WizardVisualizationId} from '../../../../src/shared';
import {ColorValue} from '../../../page-objects/wizard/ColorDialog';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

import default20Palette from '../../../../src/shared/constants/colors/common/default-20';
import testPalette from '../../../../src/shared/constants/colors/common/datalens';

const defaultPaletteColorScheme = default20Palette.scheme.slice(0, 3);

const testPaletteId = testPalette.id;
const testPaletteColorScheme = testPalette.scheme.slice(0, 3);

const switchPalette = async (page: Page, paletteId: string) => {
    await page.click(slct(DialogColorQa.PaletteSelect));
    await page.click(slct(paletteId));
    await page.click(slct(DialogColorQa.ApplyButton));
};

const getColumnWithColorSelector = (color: string) => `//*[@fill='${color}']`;

const waitForColorsInChartkit = async (page: Page, colors: string[]) => {
    return Promise.all(
        colors.map((color) => page.waitForSelector(getColumnWithColorSelector(color))),
    );
};

datalensTest.describe('Wizard - colors section', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);
    });

    datalensTest(
        'User is changing default palette - chart should be colored using selected palette',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');

            await wizardPage.filterEditor.selectValues([
                'Jejsk',
                'Soci',
                'Syzran',
                'Ufa',
                'Vladimir',
            ]);

            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'City');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'City');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'City');

            await waitForColorsInChartkit(page, [...defaultPaletteColorScheme]);

            await wizardPage.colorDialog.open();

            await switchPalette(page, testPaletteId);

            await waitForColorsInChartkit(page, [...testPaletteColorScheme]);
        },
    );

    datalensTest(
        'User is changing default palette - chart should be colored using selected palette (pie chart)',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.Pie);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'City');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'Rank');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');

            await wizardPage.filterEditor.selectValues(['Abakan', 'Jejsk', 'Barnaul']);

            await wizardPage.filterEditor.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            await waitForColorsInChartkit(page, [...defaultPaletteColorScheme]);

            await wizardPage.colorDialog.open({isPieOrDonut: true});

            await switchPalette(page, testPaletteId);

            await waitForColorsInChartkit(page, [...testPaletteColorScheme]);

            await wizardPage.colorDialog.open({isPieOrDonut: true});

            await wizardPage.colorDialog.selectFieldValue('Jejsk');

            await wizardPage.colorDialog.selectColor(ColorValue.Orange);

            await wizardPage.colorDialog.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            const expectedColors = [...testPaletteColorScheme];

            await waitForColorsInChartkit(page, expectedColors);

            await wizardPage.setVisualization(WizardVisualizationId.Donut);

            await wizardPage.chartkit.waitUntilLoaderExists();

            await waitForColorsInChartkit(page, expectedColors);
        },
    );
});
