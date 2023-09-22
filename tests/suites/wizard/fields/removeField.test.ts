import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard Fields', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'City', {
            waitForApiRun: true,
        });

        await waitForCondition(async () => {
            const placeholderItems = await wizardPage.sectionVisualization.getPlaceholderItems(
                PlaceholderName.X,
            );

            return placeholderItems.length === 1;
        });
    });

    datalensTest('Deleting fields via click', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.X, 'City');

        await waitForCondition(async () => {
            const placeholderItems = await wizardPage.sectionVisualization.getPlaceholderItems(
                PlaceholderName.X,
            );

            return placeholderItems.length === 0;
        });
    });

    datalensTest('Deleting fields by dragging', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.removeFieldByDragAndDrop(PlaceholderName.X, 'City');

        await waitForCondition(async () => {
            const placeholderItems = await wizardPage.sectionVisualization.getPlaceholderItems(
                PlaceholderName.X,
            );

            return placeholderItems.length === 0;
        });
    });

    datalensTest(
        'Deleting quickFormula fields deletes those fields that were selected',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Population', {
                waitForApiRun: true,
            });

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Y,
                'Population String',
                {waitForApiRun: true},
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Rank', {
                waitForApiRun: true,
            });

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Latitude1', {
                waitForApiRun: true,
            });

            expect(
                (await wizardPage.sectionVisualization.getPlaceholderItems(PlaceholderName.Y))
                    .length,
            ).toEqual(4);

            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.Y,
                'Population',
            );

            expect(
                (await wizardPage.sectionVisualization.getPlaceholderItems(PlaceholderName.Y))
                    .length,
            ).toEqual(3);

            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.Y,
                'Latitude1',
            );

            expect(
                (await wizardPage.sectionVisualization.getPlaceholderItems(PlaceholderName.Y))
                    .length,
            ).toEqual(2);

            await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.Y, 'Rank');

            expect(
                (await wizardPage.sectionVisualization.getPlaceholderItems(PlaceholderName.Y))
                    .length,
            ).toEqual(1);

            const fields = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                PlaceholderName.Y,
            );

            expect(fields.join()).toEqual(['Population String'].join());
        },
    );
});
