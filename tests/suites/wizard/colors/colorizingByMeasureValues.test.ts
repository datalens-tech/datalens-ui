import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Color section', () => {
    datalensTest.beforeEach(async ({page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);
    });

    datalensTest(
        'When replacing Measure Names with Measure Values, the fields in the Y section remain in place',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            const yItems = await wizardPage.sectionVisualization.getPlaceholderItems(
                PlaceholderName.Y,
            );

            const colorItemsText =
                await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Colors,
                );

            expect(yItems).toHaveLength(2);
            expect(colorItemsText.join()).toEqual(['Measure Names'].join());

            await wizardPage.sectionVisualization.replaceFieldByDragAndDrop(
                PlaceholderName.Colors,
                'Measure Names',
                'Measure Values',
            );

            const yItemsAfterChange = await wizardPage.sectionVisualization.getPlaceholderItems(
                PlaceholderName.Y,
            );

            const colorItemsInnerTextAfterChange =
                await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                    PlaceholderName.Colors,
                );

            expect(yItemsAfterChange).toHaveLength(2);

            expect(colorItemsInnerTextAfterChange.join()).toEqual(['Measure Values'].join());
        },
    );
});
