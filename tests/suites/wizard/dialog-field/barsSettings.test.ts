import {DialogFieldBarsSettingsQa, BarsColorType} from '../../../../src/shared/constants';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CommonSelectors} from '../../../page-objects/constants/common-selectors';

const NEO_PALETTE_SCHEME = [
    '#DB9101',
    '#4DA2F1',
    '#8AD554',
    '#BA74B3',
    '#FF3D64',
    '#FFC636',
    '#0CA18C',
    '#DBA2D7',
    '#BF2543',
    '#84D1EE',
    '#6B6B6B',
    '#EEB184',
    '#1E69A9',
    '#FF7E00',
    '#54A520',
    '#B9B0AC',
    '#58A9C8',
    '#FFB46C',
    '#70C1AF',
    '#FF90A1',
];

const DEFAULT_PALETTE_SCHEME = [
    '#4DA2F1',
    '#FF3D64',
    '#8AD554',
    '#FFC636',
    '#FFB9DD',
    '#84D1EE',
    '#FF91A1',
    '#54A520',
    '#DB9100',
    '#BA74B3',
    '#1F68A9',
    '#ED65A9',
    '#0FA08D',
    '#FF7E00',
    '#E8B0A4',
    '#52A6C5',
    '#BE2443',
    '#70C1AF',
    '#FFB46C',
    '#DCA3D7',
];

datalensTest.describe('Wizard - Setting up bars', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
    });

    datalensTest(
        'When the linear indicator is turned on, a bar should appear instead of a number',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Sales',
            );

            await waitForCondition(async () => {
                const texts = await wizardPage.chartkit.getRowsTexts();
                return texts.length === 1 && texts[0][0] === '2 297 241,50';
            }).catch(() => {
                throw new Error('Table not rendered');
            });

            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                'Sales',
            );

            await wizardPage.visualizationItemDialog.barsSettings.switchBars();

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await waitForCondition(async () => {
                const barsCell = await wizardPage.page.$('.chartkit-table-bar');
                const textContent = await wizardPage.chartkit.getRowsTexts();

                return (
                    barsCell !== null &&
                    textContent.length === 1 &&
                    textContent[0][0] === '2 297 241,50'
                );
            }).catch(() => {
                throw new Error('The linear indicator was not drawn');
            });
        },
    );
    datalensTest(
        'When the labels are turned off, the text of the linear indicator disappears',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Sales',
            );

            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                'Sales',
            );

            await wizardPage.visualizationItemDialog.barsSettings.switchBars();

            await wizardPage.visualizationItemDialog.barsSettings.switchLabels();

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await waitForCondition(async () => {
                const barsCell = await wizardPage.page.$('.chartkit-table-bar');
                const textContent = await wizardPage.chartkit.getRowsTexts();

                return barsCell !== null && textContent.length === 1 && textContent[0][0] === '';
            }).catch(() => {
                throw new Error("Text didn't turn off");
            });
        },
    );

    datalensTest('When switching the fill type, selectors for colors change', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Sales',
        );

        await wizardPage.visualizationItemDialog.open(PlaceholderName.FlatTableColumns, 'Sales');

        await wizardPage.visualizationItemDialog.barsSettings.switchBars();

        const defaultSelectedType = await wizardPage.page.$(
            `${slct(
                DialogFieldBarsSettingsQa.ColorTypeRadioButtons,
            )} .g-segmented-radio-group__option_checked`,
        );

        const defaultSelectedTypeButton = await defaultSelectedType?.$(
            CommonSelectors.RadioButtonOptionControl,
        );

        const defaultSelectedTypeText = await defaultSelectedTypeButton?.getAttribute('value');

        expect(defaultSelectedTypeText).toEqual('two-color');

        const positiveColorSelector = await wizardPage.page.$(
            slct(DialogFieldBarsSettingsQa.PositiveColorSelector),
        );
        const negativeColorSelector = await wizardPage.page.$(
            slct(DialogFieldBarsSettingsQa.NegativeColorSelector),
        );

        expect(positiveColorSelector).not.toEqual(null);
        expect(negativeColorSelector).not.toEqual(null);

        await wizardPage.visualizationItemDialog.barsSettings.switchColorSettings(
            BarsColorType.OneColor,
        );

        const oneColorSelector = await wizardPage.page.$(
            slct(DialogFieldBarsSettingsQa.ColorSelector),
        );

        expect(oneColorSelector).not.toEqual(null);

        await wizardPage.visualizationItemDialog.barsSettings.switchColorSettings(
            BarsColorType.Gradient,
        );

        const gradientColorSelector = await wizardPage.page.$(
            slct(DialogFieldBarsSettingsQa.GradientColorSelector),
        );

        expect(gradientColorSelector).not.toEqual(null);
    });

    datalensTest('When switching the Scale mode, inputs are being stripped', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Sales',
        );

        await wizardPage.visualizationItemDialog.open(PlaceholderName.FlatTableColumns, 'Sales');

        await wizardPage.visualizationItemDialog.barsSettings.switchBars();

        const inputs = await wizardPage.page.$$(
            `${slct(DialogFieldBarsSettingsQa.ScaleInputsWrapper)} input`,
        );

        const allInputsDisabled = await Promise.all(inputs.map((input) => input.isDisabled()));

        expect(allInputsDisabled).toEqual([true, true]);

        await wizardPage.visualizationItemDialog.barsSettings.switchScaleMode('manual');

        const inputsAfterChange = await wizardPage.page.$$(
            `${slct(DialogFieldBarsSettingsQa.ScaleInputsWrapper)} input`,
        );

        const allInputsEnabled = await Promise.all(
            inputsAfterChange.map((input) => input.isDisabled()),
        );

        expect(allInputsEnabled).toEqual([false, false]);
    });

    datalensTest('You can switch between palettes', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Sales',
        );

        await wizardPage.visualizationItemDialog.open(PlaceholderName.FlatTableColumns, 'Sales');

        await wizardPage.visualizationItemDialog.barsSettings.switchBars();

        await wizardPage.visualizationItemDialog.barsSettings.openColorPopup('positive');

        const defaultPalette =
            await wizardPage.visualizationItemDialog.barsSettings.getCurrentColorPaletteScheme();

        expect(defaultPalette).toEqual(DEFAULT_PALETTE_SCHEME);

        await wizardPage.visualizationItemDialog.barsSettings.changePalette('Neo 20');

        const currentPalette =
            await wizardPage.visualizationItemDialog.barsSettings.getCurrentColorPaletteScheme();

        expect(currentPalette).toEqual(NEO_PALETTE_SCHEME);
    });
});
