import {Page} from '@playwright/test';
import {LineShapeType} from '../../../../src/shared/constants';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {DOMNamedAttributes} from '../../../page-objects/wizard/ChartKit';
import {ColorValue} from '../../../page-objects/wizard/ColorDialog';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {DashArrayLineType} from '../../../page-objects/wizard/ShapeDialog';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {mapColorsAndShapes, openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard is a combination of Colors together with Shapes', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Region');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Shapes, 'Segment');
    });

    datalensTest(
        'Should split by Colors and Shapes when there is no selected field in the Colors, in the format: color1-form1, color1-form2',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedResult = [
                {
                    color: ColorValue.Green,
                    shape: DashArrayLineType[LineShapeType.Solid],
                },
                {
                    color: ColorValue.Green,
                    shape: DashArrayLineType[LineShapeType.Dash],
                },
                {
                    color: ColorValue.Green,
                    shape: DashArrayLineType[LineShapeType.Dot],
                },
            ];

            await wizardPage.colorDialog.open();

            await wizardPage.colorDialog.selectColor(ColorValue.Green);

            await wizardPage.colorDialog.apply();

            let result: {color: string; shape: string}[];

            await waitForCondition(async () => {
                const colors = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.Stroke,
                );

                const shapes = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.StrokeDashArray,
                );

                result = mapColorsAndShapes(colors, shapes);

                return JSON.stringify(result) === JSON.stringify(expectedResult);
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
