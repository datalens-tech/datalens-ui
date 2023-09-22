import {Page} from '@playwright/test';
import {LineShapeType} from '../../../../src/shared/constants';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {DOMNamedAttributes} from '../../../page-objects/wizard/ChartKit';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {DashArrayLineType} from '../../../page-objects/wizard/ShapeDialog';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - section "Forms" (Measure Names)', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Region');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');
    });

    datalensTest(
        'If you add a second metric to Y, then the lines should not automatically split (remain Solid)',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            let lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines[0]).toEqual(DashArrayLineType[LineShapeType.Solid]);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.chartkit.waitUntilLoaderExists();

            const fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                PlaceholderName.Shapes,
            );

            expect(fieldName.join()).toEqual('Measure Names');

            lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines).toEqual([
                DashArrayLineType[LineShapeType.Solid],
                DashArrayLineType[LineShapeType.Solid],
            ]);
        },
    );

    datalensTest(
        'If you add a metric to Y2, then the lines should not automatically split (remain Solid)',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            let lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines[0]).toEqual(DashArrayLineType[LineShapeType.Solid]);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Sales');

            const expectedResult = [
                DashArrayLineType[LineShapeType.Solid],
                DashArrayLineType[LineShapeType.Solid],
            ];

            await waitForCondition(async () => {
                lines = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.StrokeDashArray,
                );

                return JSON.stringify(lines) === JSON.stringify(expectedResult);
            }).catch(() => {
                throw new Error(
                    `Expected result ${JSON.stringify(
                        expectedResult,
                    )} - current result ${JSON.stringify(lines)}`,
                );
            });
        },
    );

    datalensTest(
        'If you add a metric to Y2 and add a color, then the lines should not automatically split (remain Solid)',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            let lines = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.StrokeDashArray,
            );

            expect(lines[0]).toEqual(DashArrayLineType[LineShapeType.Solid]);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Sales');

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );

            const expectedResult = new Array(6).fill(DashArrayLineType[LineShapeType.Solid]);

            await waitForCondition(async () => {
                lines = await wizardPage.chartkit.getAttributeFromLines(
                    DOMNamedAttributes.StrokeDashArray,
                );

                return JSON.stringify(lines) === JSON.stringify(expectedResult);
            }).catch(() => {
                throw new Error(
                    `Expected result ${JSON.stringify(
                        expectedResult,
                    )} - current result ${JSON.stringify(lines)}`,
                );
            });
        },
    );

    datalensTest(
        'If you add the Measure Names field and try to add a second field, Measure Names will disappear from the section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Measure Names',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Category',
            );

            const fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                PlaceholderName.Shapes,
            );

            expect(fieldName.join()).toEqual('Category');
        },
    );

    datalensTest(
        'If there are two fields in "Y", Measure Names is in "Forms", then when adding the second field to "Forms", the second field from "Y" and Measure Names from "Forms" will disappear',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            let yAxisFieldNames;
            let fieldName;

            await waitForCondition(async () => {
                yAxisFieldNames =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Y,
                    );
                fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Shapes,
                );

                return (
                    yAxisFieldNames.join(',') === ['Profit', 'Sales'].join(',') &&
                    fieldName.join() === 'Measure Names'
                );
            });

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Category',
            );

            await waitForCondition(async () => {
                fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Shapes,
                );
                yAxisFieldNames =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Y,
                    );

                return fieldName.join() === 'Category' && yAxisFieldNames.join() === 'Profit';
            });
        },
    );

    datalensTest(
        'If there are two fields in "Y2", Measure Names is in "Forms", then when adding the second field to "Forms", the second field from "Y2" and Measure Names from "Forms" will disappear',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.Y, 'Profit');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Profit');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Sales');

            let yAxisFieldNames;
            let fieldName;

            await waitForCondition(async () => {
                yAxisFieldNames =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Y2,
                    );
                fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Shapes,
                );

                return (
                    yAxisFieldNames.join(',') === ['Profit', 'Sales'].join(',') &&
                    fieldName.join() === 'Measure Names'
                );
            });

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Shapes,
                'Category',
            );

            await waitForCondition(async () => {
                fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Shapes,
                );
                yAxisFieldNames =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Y2,
                    );

                return fieldName.join() === 'Category' && yAxisFieldNames.join() === 'Profit';
            });
        },
    );
});
