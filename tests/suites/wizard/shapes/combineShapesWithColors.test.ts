import {Page} from '@playwright/test';
import {LineShapeType} from '../../../../src/shared/constants';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {DOMNamedAttributes} from '../../../page-objects/wizard/ChartKit';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {DashArrayLineType} from '../../../page-objects/wizard/ShapeDialog';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {mapColorsAndShapes, openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - using Shapes together with Colors', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Region');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Category');
    });

    datalensTest(
        'Should split by Colors and Shapes automatically, in the format: color1 - form1, color1 - form2',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedResult = [
                {
                    color: '#4DA2F1',
                    shape: DashArrayLineType[LineShapeType.Solid],
                },
                {
                    color: '#4DA2F1',
                    shape: DashArrayLineType[LineShapeType.Dash],
                },
                {
                    color: '#4DA2F1',
                    shape: DashArrayLineType[LineShapeType.Dot],
                },
                {
                    color: '#FF3D64',
                    shape: DashArrayLineType[LineShapeType.Solid],
                },
                {
                    color: '#FF3D64',
                    shape: DashArrayLineType[LineShapeType.Dash],
                },
                {
                    color: '#FF3D64',
                    shape: DashArrayLineType[LineShapeType.Dot],
                },
                {
                    color: '#8AD554',
                    shape: DashArrayLineType[LineShapeType.Solid],
                },
                {
                    color: '#8AD554',
                    shape: DashArrayLineType[LineShapeType.Dash],
                },
                {
                    color: '#8AD554',
                    shape: DashArrayLineType[LineShapeType.Dot],
                },
            ];
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Segment',
            );

            await wizardPage.chartkit.waitUntilLoaderExists();

            let result: {color: string; shape: string}[];

            await waitForCondition(async () => {
                const shapes = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.StrokeDashArray,
                );

                const colors = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.Stroke,
                );

                expect(colors.length).toEqual(9);
                expect(shapes.length).toEqual(9);

                result = mapColorsAndShapes(colors, shapes);

                expect(result).toEqual(expectedResult);
                return (
                    colors.length === 9 &&
                    shapes.length === 9 &&
                    JSON.stringify(result) === JSON.stringify(expectedResult)
                );
            }).catch(() => {
                throw new Error(
                    `Expected result ${JSON.stringify(
                        expectedResult,
                    )} - current result ${JSON.stringify(result)}`,
                );
            });
        },
    );

    datalensTest(
        'Should split by Colors and Shapes automatically when the fields from the dataset are the same, in the format: color1 - form1, color2 - form2',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedResult = [
                {
                    color: '#4DA2F1',
                    shape: DashArrayLineType[LineShapeType.Solid],
                },
                {
                    color: '#FF3D64',
                    shape: DashArrayLineType[LineShapeType.Dash],
                },
                {
                    color: '#8AD554',
                    shape: DashArrayLineType[LineShapeType.Dot],
                },
            ];

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Category',
            );

            await wizardPage.chartkit.waitUntilLoaderExists();

            let result: {color: string; shape: string}[];

            await waitForCondition(async () => {
                const shapes = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.StrokeDashArray,
                );

                const colors = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.Stroke,
                );

                result = mapColorsAndShapes(colors, shapes);

                return (
                    shapes.length === 3 &&
                    colors.length === 3 &&
                    JSON.stringify(expectedResult) === JSON.stringify(result)
                );
            }).catch(() => {
                throw new Error(
                    `Expected result ${JSON.stringify(
                        expectedResult,
                    )} - current result ${JSON.stringify(result)}`,
                );
            });
        },
    );

    datalensTest(
        'Should split by Colors and Shapes when there is no selected field in the Forms, in the format: color1-form1, color2-form1',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedResult = [
                {
                    color: '#4DA2F1',
                    shape: DashArrayLineType[LineShapeType.LongDashDot],
                },
                {
                    color: '#FF3D64',
                    shape: DashArrayLineType[LineShapeType.LongDashDot],
                },
                {
                    color: '#8AD554',
                    shape: DashArrayLineType[LineShapeType.LongDashDot],
                },
            ];

            await wizardPage.shapeDialog.open();

            await wizardPage.shapeDialog.changeLineShapeType(LineShapeType.LongDashDot);

            await wizardPage.shapeDialog.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            let result: {color: string; shape: string}[];

            await waitForCondition(async () => {
                const shapes = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.StrokeDashArray,
                );

                const colors = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.Stroke,
                );

                result = mapColorsAndShapes(colors, shapes);

                return JSON.stringify(expectedResult) === JSON.stringify(result);
            }).catch(() => {
                throw new Error(
                    `Expected result ${JSON.stringify(
                        expectedResult,
                    )} - current result ${JSON.stringify(result)}`,
                );
            });
        },
    );
});
