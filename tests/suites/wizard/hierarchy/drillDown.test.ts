import {expect, Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ChartKitTableQa, WizardVisualizationId} from '../../../../src/shared';

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

            const cell = wizardPage.chartkit
                .getTableLocator()
                .locator(slct(ChartKitTableQa.CellContent));
            await expect(cell).toHaveText(firstLevelValues);

            await wizardPage.chartkit.drillDown();
            await expect(cell).toHaveText(secondLevelValues);

            await wizardPage.chartkit.drillUp();
            await expect(cell).toHaveText(firstLevelValues);
        },
    );

    datalensTest(
        'The user clicks on the line and falls into the cities, filtered by population',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            const cell = wizardPage.chartkit
                .getTableLocator()
                .locator(slct(ChartKitTableQa.CellContent));
            await expect(cell).toHaveText(['56 100', '87 600', '96 400', '159 500', '610 800']);

            await cell.getByText('56 100').click();
            await expect(cell).toHaveText(['Klimovsk', 'Krymsk']);
        },
    );
});
