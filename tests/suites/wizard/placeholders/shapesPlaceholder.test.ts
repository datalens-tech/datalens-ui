import {Page} from '@playwright/test';
import {LineShapeType, SectionVisualizationAddItemQa} from '../../../../src/shared/constants';
import {
    LINE_WIDTH_DEFAULT_VALUE,
    LINE_WIDTH_MAX_VALUE,
    LINE_WIDTH_MIN_VALUE,
    LINE_WIDTH_VALUE_STEP,
} from '../../../../src/ui/units/wizard/constants/shapes';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {DOMNamedAttributes} from '../../../page-objects/wizard/ChartKit';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {DashArrayLineType} from '../../../page-objects/wizard/ShapeDialog';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - section "Forms"', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Region');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');
    });

    datalensTest('User can change line type', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        let lines = await wizardPage.chartkit.getAttributeFromLines(
            DOMNamedAttributes.StrokeDashArray,
        );

        expect(lines.length).toEqual(1);
        expect(lines[0]).toEqual(DashArrayLineType[LineShapeType.Solid]);

        await wizardPage.shapeDialog.open();

        await wizardPage.shapeDialog.changeLineShapeType(LineShapeType.Dash);

        await wizardPage.shapeDialog.apply();

        await wizardPage.chartkit.waitUntilLoaderExists();

        lines = await wizardPage.chartkit.getAttributeFromLines(DOMNamedAttributes.StrokeDashArray);

        expect(lines.length).toEqual(1);
        expect(lines[0]).toEqual(DashArrayLineType[LineShapeType.Dash]);
    });

    datalensTest('User can change line width', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});
        const defaultLineWidth = LINE_WIDTH_DEFAULT_VALUE.toString();
        const newLineWidth = '5';

        let lineWidths = await wizardPage.chartkit.getAttributeFromLines(
            DOMNamedAttributes.StrokeWidth,
        );

        expect(lineWidths.length).toEqual(1);
        expect(lineWidths[0]).toEqual(defaultLineWidth);

        await wizardPage.shapeDialog.open();

        await wizardPage.shapeDialog.changeLineWidth(newLineWidth);

        await wizardPage.shapeDialog.apply();

        await wizardPage.chartkit.waitUntilLoaderExists();

        lineWidths = await wizardPage.chartkit.getAttributeFromLines(
            DOMNamedAttributes.StrokeWidth,
        );

        expect(lineWidths.length).toEqual(1);
        expect(lineWidths[0]).toEqual(String(newLineWidth));
    });

    datalensTest('User can only select line widths 1–12', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.shapeDialog.open();
        await wizardPage.shapeDialog.clickLineWidthSelectControl();

        const optionElements = await wizardPage.shapeDialog.getLineWidthSelectOptions();

        expect(await optionElements.count()).toEqual(LINE_WIDTH_MAX_VALUE);

        for (let i = LINE_WIDTH_MIN_VALUE; i <= LINE_WIDTH_MAX_VALUE; i += LINE_WIDTH_VALUE_STEP) {
            const optionElement = optionElements.nth(i - 1);
            const optionValue = i.toString();

            await expect(optionElement.locator(`[data-qa="${optionValue}"]`)).toBeVisible();
        }
    });

    datalensTest(
        'The user can split the indicator by measurement into forms',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            let lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines.length).toEqual(1);
            expect(lines[0]).toEqual(DashArrayLineType[LineShapeType.Solid]);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Category',
            );

            await wizardPage.chartkit.waitUntilLoaderExists();

            lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines.length).toEqual(3);
            expect(lines).toEqual([
                DashArrayLineType[LineShapeType.Solid],
                DashArrayLineType[LineShapeType.Dash],
                DashArrayLineType[LineShapeType.Dot],
            ]);
        },
    );

    datalensTest(
        'The user can split the indicator by measurement into shapes and choose the type for the line himself',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            let lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines.length).toEqual(1);
            expect(lines[0]).toEqual(DashArrayLineType[LineShapeType.Solid]);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Category',
            );

            await wizardPage.chartkit.waitUntilLoaderExists();

            lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines.length).toEqual(3);
            expect(lines).toEqual([
                DashArrayLineType[LineShapeType.Solid],
                DashArrayLineType[LineShapeType.Dash],
                DashArrayLineType[LineShapeType.Dot],
            ]);

            await wizardPage.shapeDialog.open();

            await wizardPage.shapeDialog.selectValue('Furniture');

            await wizardPage.shapeDialog.changeLineShapeType(LineShapeType.LongDashDot);

            await wizardPage.shapeDialog.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines.length).toEqual(3);
            expect(lines).toEqual([
                DashArrayLineType[LineShapeType.LongDashDot],
                DashArrayLineType[LineShapeType.Solid],
                DashArrayLineType[LineShapeType.Dash],
            ]);
        },
    );

    datalensTest(
        'Only one field can be added to the "Forms" section at a time',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Category',
            );

            await waitForCondition(async () => {
                const text =
                    await wizardPage.sectionVisualization.getPlaceholderAddItemTooltipValue(
                        PlaceholderName.Shapes,
                    );
                return text === SectionVisualizationAddItemQa.ShapesOverflowErrorTooltip;
            });
        },
    );
});
