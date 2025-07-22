import {expect, Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ChartKitQa} from '../../../../src/shared';

async function createHierarchy(wizardPage: WizardPage, hierarchyName: string, fields: string[]) {
    await wizardPage.openHierarchyEditor();

    await wizardPage.hierarchyEditor.setName(hierarchyName);

    await wizardPage.hierarchyEditor.selectFields(fields);

    await wizardPage.hierarchyEditor.clickSave();
}

const firstHierarchy = {
    name: 'Hierarchy 1',
    fields: ['Population String', 'City'],
};

const secondHierarchy = {
    name: 'Hierarchy 2',
    fields: ['City', 'Population String'],
};

datalensTest.describe('Wizard Hierarchy', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await createHierarchy(wizardPage, firstHierarchy.name, firstHierarchy.fields);

        await createHierarchy(wizardPage, secondHierarchy.name, secondHierarchy.fields);
    });

    datalensTest(
        'The user falls into cities with filtering, replaces the hierarchy, drill level and filters are reset',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                firstHierarchy.name,
            );

            const cell = wizardPage.chartkit.getTableLocator().getByText('100100');
            await cell.click();

            const breadcrumbItems = page.locator(slct(ChartKitQa.DrillBreadcrumbsItem));
            await expect(breadcrumbItems).toHaveText(['Population String: 100100', 'City'], {
                useInnerText: true,
            });

            await wizardPage.sectionVisualization.replaceFieldByDragAndDrop(
                PlaceholderName.FlatTableColumns,
                firstHierarchy.name,
                secondHierarchy.name,
            );

            await expect(breadcrumbItems).toHaveText(['City'], {
                useInnerText: true,
            });
        },
    );
});
