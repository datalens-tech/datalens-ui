import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {getXAxisValues, openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';

const checkXAxisValuesOrder = async (wizardPage: WizardPage, expectedValues: string[]) => {
    let xAxisValues: (string | null)[] = [];
    await wizardPage.chartkit.waitUntilLoaderExists();

    await waitForCondition(async () => {
        xAxisValues = await getXAxisValues(wizardPage.page);

        return xAxisValues.join(',') === expectedValues.join(',');
    }).catch(() => {
        throw new Error(
            `Expected order [${expectedValues.join(',')}], current order [${xAxisValues.join(
                ',',
            )}]`,
        );
    });
};

const expectedNumericValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const expectedValuesAfterNumericSort = [
    '12',
    '9',
    '11',
    '10',
    '3',
    '5',
    '8',
    '6',
    '7',
    '4',
    '2',
    '1',
];

const expectedValuesAfterChangeNumericSort = [
    '1',
    '2',
    '4',
    '7',
    '6',
    '8',
    '5',
    '3',
    '10',
    '11',
    '9',
    '12',
];

const expectedDateValues = [
    '01.12.17',
    '02.12.17',
    '03.12.17',
    '04.12.17',
    '05.12.17',
    '06.12.17',
    '07.12.17',
];

const expectedDateValuesAfterChangeSort = [
    '07.12.2017',
    '04.12.2017',
    '02.12.2017',
    '06.12.2017',
    '03.12.2017',
    '05.12.2017',
    '01.12.2017',
];

const expectedDateValuesAfterSort = [
    '01.12.2017',
    '05.12.2017',
    '03.12.2017',
    '06.12.2017',
    '02.12.2017',
    '04.12.2017',
    '07.12.2017',
];

datalensTest.describe('Wizard - Sort', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);
    });

    datalensTest(
        'When you click on the sorting icon, the order changes along the X axis (ascending/descending)',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.Line);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, 'Category');

            const expectedValues = ['Technology', 'Office Supplies', 'Furniture'];

            await checkXAxisValuesOrder(wizardPage, expectedValues);

            await wizardPage.sectionVisualization.clickOnSortIcon();

            const expectedValuesAfterSort = ['Furniture', 'Office Supplies', 'Technology'];

            await checkXAxisValuesOrder(wizardPage, expectedValuesAfterSort);
        },
    );

    datalensTest(
        'Sorting works if there is a field with the number type in section X',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Month');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            await checkXAxisValuesOrder(wizardPage, expectedNumericValues);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, 'Profit');

            await checkXAxisValuesOrder(wizardPage, expectedValuesAfterNumericSort);

            await wizardPage.sectionVisualization.clickOnSortIcon();

            await checkXAxisValuesOrder(wizardPage, expectedValuesAfterChangeNumericSort);
        },
    );

    datalensTest(
        'Sorting works if there is a field with the number type in section X and there is the same field in colors as in X',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Month');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Month');

            await checkXAxisValuesOrder(wizardPage, expectedNumericValues);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, 'Profit');

            await checkXAxisValuesOrder(wizardPage, expectedValuesAfterNumericSort);

            await wizardPage.sectionVisualization.clickOnSortIcon();

            await checkXAxisValuesOrder(wizardPage, expectedValuesAfterChangeNumericSort);
        },
    );

    datalensTest(
        'Sorting works if there is a field with the Date type in section X',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'DATE');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            // There are too many dates in the dataset.
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'DATE');

            await wizardPage.filterEditor.selectRangeDate(['01.12.2017', '07.12.2017']);

            await wizardPage.filterEditor.apply();

            await checkXAxisValuesOrder(wizardPage, expectedDateValues);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, 'Profit');

            await checkXAxisValuesOrder(wizardPage, expectedDateValuesAfterSort);

            await wizardPage.sectionVisualization.clickOnSortIcon();

            await checkXAxisValuesOrder(wizardPage, expectedDateValuesAfterChangeSort);
        },
    );

    datalensTest(
        'Sorting works if there is a field with the number type in section X, and the same field in the Sorting',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.Line);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Month');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, 'Month');

            await checkXAxisValuesOrder(wizardPage, [...expectedNumericValues].reverse());

            await wizardPage.sectionVisualization.clickOnSortIcon();

            await checkXAxisValuesOrder(wizardPage, expectedNumericValues);

            await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.Sort, 'Month');

            await wizardPage.setVisualization(WizardVisualizationId.Column);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, 'Month');

            await checkXAxisValuesOrder(wizardPage, [...expectedNumericValues].reverse());

            await wizardPage.sectionVisualization.clickOnSortIcon();

            await checkXAxisValuesOrder(wizardPage, expectedNumericValues);
        },
    );

    datalensTest(
        'Sorting works if we sort by the same field that lies in the Color section when the number type lies there',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.Area);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            const formula = `FLOAT(ROUND([Month]/123, 2))`;
            const name = 'FloatColor';

            await wizardPage.createNewFieldWithFormula(name, formula);

            const expectedValues = [
                '0.1',
                '0.09',
                '0.08',
                '0.07',
                '0.06',
                '0.05',
                '0.04',
                '0.03',
                '0.02',
                '0.01',
            ];

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, name);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, name);

            let legendItemsTexts: string[] = [];

            await waitForCondition(async () => {
                const legendItems = await wizardPage.page.$$(
                    COMMON_CHARTKIT_SELECTORS.chartLegendItem,
                );

                if (!legendItems?.length) {
                    return false;
                }

                legendItemsTexts = (await Promise.all(
                    legendItems.map((item) => item.textContent()),
                )) as string[];

                return legendItemsTexts.join(',') === expectedValues.join(',');
            }).catch(() => {
                throw new Error(
                    `Expected order [${expectedValues.join(
                        ',',
                    )}], current order [${legendItemsTexts.join(',')}]`,
                );
            });
        },
    );

    datalensTest(
        'Sorting works if we sort by the same field that lies in the Color section when there is an Indicator',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.Column);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Month');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Profit');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Sort, 'Profit');

            const expectedSortedCategories = [
                '12',
                '9',
                '11',
                '10',
                '3',
                '5',
                '8',
                '6',
                '7',
                '4',
                '2',
                '1',
            ];

            await checkXAxisValuesOrder(wizardPage, expectedSortedCategories);

            await wizardPage.sectionVisualization.clickOnSortIcon();

            await checkXAxisValuesOrder(wizardPage, [...expectedSortedCategories].reverse());
        },
    );
});
