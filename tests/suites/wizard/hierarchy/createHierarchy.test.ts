import {ElementHandle, Page, expect} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard Hierarchy', () => {
    datalensTest('Creating a hierarchy with a custom name', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.openHierarchyEditor();

        await wizardPage.hierarchyEditor.setName('City > Rank');

        await wizardPage.hierarchyEditor.selectFields(['Rank', 'City']);

        await wizardPage.hierarchyEditor.clickSave();

        let hierarchies: ElementHandle<SVGElement | HTMLElement>[] = [];

        await waitForCondition(async () => {
            hierarchies = await wizardPage.getHierarchies();

            return hierarchies.length === 1;
        });

        const [hierarchy] = hierarchies;

        const hierarchyName = await hierarchy.innerText();

        expect(hierarchyName).toEqual('City > Rank');
    });

    datalensTest(
        'The created hierarchies should be automatically named "New Hierarchy (N)"',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

            for (let i = 0; i < 2; i++) {
                await wizardPage.openHierarchyEditor();

                await wizardPage.hierarchyEditor.selectFields(['Rank', 'City']);

                await wizardPage.hierarchyEditor.clickSave();
            }

            let hierarchies: ElementHandle<SVGElement | HTMLElement>[] = [];

            await waitForCondition(async () => {
                hierarchies = await wizardPage.getHierarchies();

                return hierarchies.length === 2;
            });

            const hierarchyNames = await Promise.all(
                hierarchies.map((hierarchy) => hierarchy.innerText()),
            );

            expect(hierarchyNames).toHaveLength(2);
            expect(hierarchyNames[1].replace(/&nbsp;/g, ' ')).toMatch(
                new RegExp(`${hierarchyNames[0]} \\(1\\)`),
            );
        },
    );

    datalensTest(
        'You cannot create two hierarchies with the same name',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.setName('Hierarchy Name');
            await wizardPage.hierarchyEditor.selectFields(['Rank', 'City']);
            await wizardPage.hierarchyEditor.clickSave();

            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.selectFields(['Rank', 'City']);

            let isApplyButtonDisabled = await wizardPage.hierarchyEditor.isApplyButtonDisabled();

            expect(isApplyButtonDisabled).toEqual(false);

            await wizardPage.hierarchyEditor.setName('Hierarchy Name');

            const errorText = wizardPage.hierarchyEditor.getHierarchyNameError();
            isApplyButtonDisabled = await wizardPage.hierarchyEditor.isApplyButtonDisabled();

            await expect(errorText).toBeVisible();
            expect(isApplyButtonDisabled).toEqual(true);
        },
    );
});
