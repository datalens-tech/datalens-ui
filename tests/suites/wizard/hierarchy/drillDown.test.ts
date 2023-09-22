import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const getTableValues = async (page: Page) => {
    const elements = await page.$$(
        'td.chartkit-table__cell_type_text, td.chartkit-table__cell_type_number',
    );

    const strings: (string | null)[] = await Promise.all(elements.map((el) => el.textContent()));

    return strings.map((str) => {
        if (str) {
            return str.replace(/\u00a0/g, ' ');
        }

        return str;
    });
};

datalensTest.describe('Wizard Hierarchy', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const hierarchyName = 'Hierarchy for detail';

        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.openHierarchyEditor();

        await wizardPage.hierarchyEditor.setName(hierarchyName);

        await wizardPage.hierarchyEditor.selectFields(['Population', 'City']);

        await wizardPage.hierarchyEditor.clickSave();

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            hierarchyName,
        );

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');

        await wizardPage.filterEditor.selectValues([
            'Abakan',
            'Jejsk',
            'Barnaul',
            'Glazov',
            'Klimovsk',
            'Krymsk',
        ]);

        await wizardPage.filterEditor.apply();

        await waitForCondition(async () => {
            const tableValues = await getTableValues(page);

            return tableValues.length > 0;
        });
    });

    datalensTest(
        'The user clicks on the arrow and falls into the cities, and then returns back',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const firstLevelValues = ['56 100', '87 600', '96 400', '159 500', '610 800'];
            const secondLevelValues = [
                'Abakan',
                'Barnaul',
                'Glazov',
                'Jejsk',
                'Klimovsk',
                'Krymsk',
            ];

            await waitForCondition(async () => {
                const tableValues = await getTableValues(page);

                return (
                    tableValues.slice(0, firstLevelValues.length).join() === firstLevelValues.join()
                );
            });

            await wizardPage.chartkit.drillDown();

            await waitForCondition(async () => {
                const tableValues = await getTableValues(page);

                return (
                    tableValues.slice(0, secondLevelValues.length).join() ===
                    secondLevelValues.join()
                );
            });

            await wizardPage.chartkit.drillUp();

            await waitForCondition(async () => {
                const tableValues = await getTableValues(page);

                return (
                    tableValues.slice(0, firstLevelValues.length).join() === firstLevelValues.join()
                );
            });
        },
    );

    datalensTest(
        'The user clicks on the line and falls into the cities, filtered by population',
        async ({page}: {page: Page}) => {
            await waitForCondition(async () => {
                const tableValues = await getTableValues(page);
                const expectedValues = ['56 100', '87 600', '96 400', '159 500', '610 800'];

                return tableValues.slice(0, expectedValues.length).join() === expectedValues.join();
            });

            await page.click('td.chartkit-table__cell_type_number >> text=56 100');

            await waitForCondition(async () => {
                const tableValues = await getTableValues(page);

                const expectedValues = ['Klimovsk', 'Krymsk'];

                return tableValues.join() === expectedValues.join();
            });
        },
    );
});
