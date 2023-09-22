import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PseudoField} from '../../../page-objects/wizard/Field';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DOMNamedAttributes} from '../../../page-objects/wizard/ChartKit';
import {CommonUrls} from '../../../page-objects/constants/common-urls';

datalensTest.describe('Wizard - section "Colors"', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);
    });

    datalensTest(
        'When deleting the second field from the "Y2" section, the measure names field should remain in the "Colors" section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Year');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'float');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Profit');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Sales');

            await waitForCondition(async () => {
                const fieldNames =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Y2,
                    );

                return fieldNames.join(',') === ['Profit', 'Sales'].join(',');
            });

            await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.Y2, 'Sales');

            await wizardPage.page.waitForSelector(
                `${slct(PlaceholderName.Colors)} .pseudo-item >> text=${PseudoField.MeasureNames}`,
            );
        },
    );

    datalensTest(
        'If you add the Measure Names field and try to add a second field, Measure Names will disappear from the section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Year');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'float');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Measure Names',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );

            const fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                PlaceholderName.Colors,
            );

            expect(fieldName.join()).toEqual('Category');
        },
    );

    datalensTest(
        'If there are two fields in "Y", Measure Names is in "Colors", then when adding the second field to "Colors", the second field from "Y" and Measure Names from "Color" will disappear',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Year');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'float');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            let yAxisFieldNames;
            let fieldName;

            await waitForCondition(async () => {
                yAxisFieldNames =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Y,
                    );
                fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Colors,
                );

                return (
                    yAxisFieldNames.join(',') === ['float', 'Sales'].join(',') &&
                    fieldName.join() === 'Measure Names'
                );
            });

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );

            await waitForCondition(async () => {
                fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Colors,
                );
                yAxisFieldNames =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Y,
                    );

                return fieldName.join() === 'Category' && yAxisFieldNames.join() === 'float';
            });
        },
    );

    datalensTest(
        'If there are two fields in "Y2", Measure Names is in "Colors", then when adding the second field to "Colors", the second field from "Y2" and Measure Names from "Color" will disappear',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Year');
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
                    PlaceholderName.Colors,
                );

                return (
                    yAxisFieldNames.join(',') === ['Profit', 'Sales'].join(',') &&
                    fieldName.join() === 'Measure Names'
                );
            });

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );

            await waitForCondition(async () => {
                fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Colors,
                );
                yAxisFieldNames =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Y2,
                    );

                return fieldName.join() === 'Category' && yAxisFieldNames.join() === 'Profit';
            });
        },
    );

    datalensTest(
        'Multidatasets. Fields with the same name should be automatically colored in different colors',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.addAdditionalDataset(RobotChartsDatasets.DatasetWithParameters);

            const apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await (await apiRunRequest).response();

            const colors = await wizardPage.chartkit.getAttributeFromLines(
                DOMNamedAttributes.Stroke,
            );

            expect(colors).toEqual(['#4DA2F1', '#FF3D64']);
        },
    );
});
