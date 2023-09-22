import {Page} from '@playwright/test';
import {LineShapeType, SectionVisualizationAddItemQa} from '../../../../src/shared/constants';

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
