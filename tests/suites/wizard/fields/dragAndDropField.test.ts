import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const validatePlaceholders = async ({
    wizardPage,
    expectedFiltersValue,
    expectedSortValue,
}: {
    wizardPage: WizardPage;
    expectedSortValue: string;
    expectedFiltersValue: string;
}) => {
    let sortPlaceholderItemsText: string[] = [];
    let filtersPlaceholderItemsText: string[] = [];

    await waitForCondition(async () => {
        sortPlaceholderItemsText =
            await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                PlaceholderName.Sort,
            );

        filtersPlaceholderItemsText =
            await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                PlaceholderName.Filters,
            );

        return (
            sortPlaceholderItemsText.join(',') === expectedSortValue &&
            filtersPlaceholderItemsText.join(',') === expectedFiltersValue
        );
    }).catch(() => {
        throw new Error(
            `Fields in sortPlaceholder: ${sortPlaceholderItemsText} and expected City: ${expectedSortValue}; fields in filtersPlaceholder: ${filtersPlaceholderItemsText} and expected ${expectedFiltersValue}`,
        );
    });
};

const TIMEOUT = 100;

const validateTableRows = async ({
    wizardPage,
    expectedRows,
}: {
    wizardPage: WizardPage;
    expectedRows: string[];
}) => {
    let result: string[] = [];
    await waitForCondition(async () => {
        const afterDnDRowsValues = await wizardPage.chartkit.getRowsTexts();
        result = afterDnDRowsValues.reduce((acc, item) => {
            return [...acc, item[0]];
        }, [] as string[]);

        return result.join(',') === expectedRows.join(',');
    }).catch(() => {
        throw new Error(`Rows in the ${expectedRows} table were expected, but received ${result}`);
    });
};

datalensTest.describe('Wizard Fields', () => {
    datalensTest("You can't drag the field you've set", async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'City',
        );

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');

        const wizardFilterValues = ['Abakan', 'Jejsk'];

        await wizardPage.filterEditor.selectValues(wizardFilterValues);

        await wizardPage.filterEditor.apply();

        await page.waitForTimeout(TIMEOUT);

        await wizardPage.sectionVisualization.dragAndDropFieldBetweenPlaceholders({
            from: PlaceholderName.Filters,
            to: PlaceholderName.Sort,
            fieldName: 'City',
        });

        const placeholderItemTextValue = 'City: Abakan,Jejsk';

        await validatePlaceholders({
            wizardPage,
            expectedSortValue: placeholderItemTextValue,
            expectedFiltersValue: '',
        });

        await page.waitForTimeout(TIMEOUT);

        await wizardPage.sectionVisualization.dragAndDropFieldBetweenPlaceholders({
            from: PlaceholderName.Sort,
            to: PlaceholderName.Filters,
            fieldName: 'City',
        });

        await validateTableRows({wizardPage, expectedRows: wizardFilterValues});

        await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName('test-DnD-disabled-field'));

        const searchParams = new URLSearchParams();

        const dashboardFilter = 'Barnaul';

        searchParams.set('City', dashboardFilter);

        await wizardPage.page.goto(`${wizardPage.page.url()}?${searchParams.toString()}`);

        await validateTableRows({wizardPage, expectedRows: [dashboardFilter]});

        await page.waitForTimeout(TIMEOUT);

        await wizardPage.sectionVisualization.dragAndDropFieldBetweenPlaceholders({
            from: PlaceholderName.Filters,
            to: PlaceholderName.Sort,
            fieldName: 'City',
        });

        await validatePlaceholders({
            wizardPage,
            expectedFiltersValue: placeholderItemTextValue,
            expectedSortValue: '',
        });

        await wizardPage.deleteEntry();
    });
});
