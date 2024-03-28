import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

import {pivotTableWithBigHeaderMock, pivotTableWithBigRowHeaderMock} from './mocks/headerMock';

datalensTest.describe('Wizard - Summary table, formation of columns and rows', () => {
    datalensTest(
        'The table must be successfully rendered with a complex three-level header in the header',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.PivotTableWithBigHeader);

            const headRows = await wizardPage.chartkit.getHeadRowsTexts();
            expect(headRows).toEqual(pivotTableWithBigHeaderMock.headRows);

            const rows = await wizardPage.chartkit.getRowsTexts();
            expect(rows).toEqual(pivotTableWithBigHeaderMock.rows);
        },
    );

    datalensTest(
        'The table must be successfully rendered with a complex three-level header in the rows',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.PivotTableWithBigRowHeader);

            const headRows = await wizardPage.chartkit.getHeadRowsTexts();
            expect(headRows).toEqual(pivotTableWithBigRowHeaderMock.headRows);

            const rows = await wizardPage.chartkit.getRowsTexts();
            expect(rows).toEqual(pivotTableWithBigRowHeaderMock.rows);
        },
    );

    datalensTest(
        'The table should be fully rendered if there is nothing in the columns',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Profit',
            );

            await wizardPage.sectionVisualization.dragAndDropFieldBetweenPlaceholders({
                from: PlaceholderName.PivotTableColumns,
                to: PlaceholderName.Rows,
                fieldName: 'Measure Names',
            });

            let rowsItems: string[] = [];
            let headRowsItems: string[] = [];

            await waitForCondition(async () => {
                const headRows = await wizardPage.chartkit.getHeadRowsTexts();

                const rows = await wizardPage.chartkit.getRowsTexts();

                if (headRows.length && rows.length) {
                    headRowsItems = headRows[0];
                    rowsItems = rows[0];
                }

                return headRowsItems.length !== 0 && rowsItems.length !== 0;
            }).catch(() => {
                throw new Error('Table not rendered');
            });

            expect(headRowsItems.length).toEqual(rowsItems.length);
        },
    );

    datalensTest(
        'The table should draw all the indicators, even if they are repeated',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Profit',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Profit',
            );

            let headRowsValues: string[] = [];
            let rowsValues: string[] = [];

            await waitForCondition(async () => {
                const headRows = await wizardPage.chartkit.getHeadRowsTexts();

                const rows = await wizardPage.chartkit.getRowsTexts();

                headRowsValues = headRows[0];
                rowsValues = rows[0];

                const isProfitRenderedTwice =
                    headRowsValues[0] &&
                    headRowsValues[2] &&
                    headRowsValues[0] === headRowsValues[2] &&
                    rowsValues[0] === rowsValues[2];

                return headRowsValues[1] === 'Sales' && isProfitRenderedTwice;
            }).catch(() => {
                throw new Error(
                    `The table was drawn with the wrong parameters: head:[${headRowsValues}], rows: [${rowsValues}]`,
                );
            });
        },
    );
});
