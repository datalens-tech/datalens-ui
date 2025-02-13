import {ElementHandle} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RevisionsPanelQa} from '../../../../src/shared';

datalensTest.describe('Wizard - saving when versioning charts', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Category',
        );

        const entryName = 'wizard-revision-e2e-test-chart';

        await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName(entryName));

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Profit',
        );

        await wizardPage.saveExistentWizardEntry();
    });

    datalensTest(
        'When you click on make relevant, the version should not save the changes made on it',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.switchToWizardSecondRevision();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Sales',
            );

            await wizardPage.revisions.makeRevisionActual();

            await waitForCondition(async () => {
                const columnItems = await wizardPage.sectionVisualization.getPlaceholderItems(
                    PlaceholderName.FlatTableColumns,
                );

                return columnItems.length === 1;
            }).catch(() => {
                throw new Error(
                    'There should be only one field in the Columns section, even after updating the revision',
                );
            });

            await wizardPage.revisions.validateRevisions(3);
        },
    );

    datalensTest(
        'When you click "Save as Draft", a revision with all changes should be created',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.switchToWizardSecondRevision();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Sales',
            );

            const apiRunSuccessfulPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.saveExistentWizardEntry();

            await apiRunSuccessfulPromise;

            await waitForCondition(async () => {
                const columnItems = await wizardPage.sectionVisualization.getPlaceholderItems(
                    PlaceholderName.FlatTableColumns,
                );

                const revisionPanel = await wizardPage.page.$(
                    slct(RevisionsPanelQa.RevisionsPanel),
                );

                return columnItems.length === 2 && revisionPanel;
            }).catch(() => {
                throw new Error('Failed to save draft correctly');
            });

            await wizardPage.revisions.validateRevisions(3);
        },
    );

    datalensTest(
        'When you click make relevant, another revision should become relevant',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.switchToWizardSecondRevision();

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.revisions.makeRevisionActual();

            await wizardPage.revisions.waitUntilRevisionPanelDisappear();

            await apiRunPromise;

            await wizardPage.revisions.validateRevisions(3);

            const revId = await wizardPage.revisions.getRevisionIdFromUrl();

            expect(revId).toBe(null);
        },
    );

    datalensTest(
        'When you click on the open current button, it opens the current version',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.switchToWizardSecondRevision();

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.revisions.openActualRevision();

            await wizardPage.revisions.waitUntilRevisionPanelDisappear();

            await apiRunPromise;

            await wizardPage.revisions.validateRevisions(2);

            await waitForCondition(async () => {
                const fields = await wizardPage.sectionVisualization.getPlaceholderItems(
                    PlaceholderName.FlatTableColumns,
                );

                const fieldsTexts = await Promise.all(fields.map((field) => field.textContent()));

                return (
                    fields.length === 2 &&
                    fieldsTexts.join(',') === ['Category', 'Profit'].join(',')
                );
            }).catch(() => {
                throw new Error('The chart revision switched, but the old chart was drawn');
            });

            const revId = await wizardPage.revisions.getRevisionIdFromUrl();

            expect(revId).toBe(null);
        },
    );

    datalensTest('Save revision as new chart', async ({page, context}) => {
        const wizardPage = new WizardPage({page});

        const initialChartEntryId = wizardPage.getEntryIdFromUrl() || undefined;

        expect(initialChartEntryId).not.toBe(undefined);

        await wizardPage.switchToWizardSecondRevision();

        await wizardPage.saveWizardAsNew(wizardPage.getUniqueEntryName('wizard-e2e-revision-test'));

        await wizardPage.chartkit.waitForSuccessfulRender();

        const newChartEntryId = wizardPage.getEntryIdFromUrl() || undefined;

        expect(newChartEntryId).not.toBe(undefined);
        expect(initialChartEntryId).not.toEqual(newChartEntryId);

        let columnItems: ElementHandle[] = [];
        let columnItemsTexts: string[] = [];

        await waitForCondition(async () => {
            columnItems = await wizardPage.sectionVisualization.getPlaceholderItems(
                PlaceholderName.FlatTableColumns,
            );

            columnItemsTexts = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                PlaceholderName.FlatTableColumns,
            );

            return (
                columnItems.length === 1 && columnItemsTexts.join(',') === ['Category'].join(',')
            );
        }).catch(() => {
            throw new Error(
                `Saving the new chart was not successful. Number of fields in the section: ${
                    columnItems.length
                }. Fields in the section: ${columnItemsTexts.join(',')};`,
            );
        });

        const secondPage = await context.newPage();

        const newWizardPage = new WizardPage({page: secondPage});

        await openTestPage(secondPage, `/wizard/${initialChartEntryId}`);

        await newWizardPage.chartkit.waitForSuccessfulRender();
    });

    datalensTest.afterEach(async ({page}, testInfo) => {
        // Otherwise, the screenshot will not be informative, since the entry will be deleted.
        if (testInfo.status !== 'failed' && testInfo.status !== 'timedOut') {
            const wizardPage = new WizardPage({page});

            await wizardPage.deleteEntry();
        }
    });
});
