import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard Fields', () => {
    datalensTest(
        'After adding the first indicator, the pseudo fields Measure Names and Measure Values should appear',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

            await waitForCondition(async () => {
                const fields = await wizardPage.getFields();
                const isMeasureNamesAndValuesExists =
                    await wizardPage.isMeasureNamesAndValuesExists();

                return fields.length > 0 && !isMeasureNamesAndValuesExists;
            });

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Population');

            await waitForCondition(async () => {
                const isMeasureNamesAndValuesExists =
                    await wizardPage.isMeasureNamesAndValuesExists();

                return isMeasureNamesAndValuesExists;
            });
        },
    );

    datalensTest(
        'By the entered value, the usual fields, the pseudo-field Measure Names/Measure Values, as well as hierarchies should be filtered',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithPseudoFieldsAndHierarchies);

            let fields = await wizardPage.getFields();

            expect(fields.length > 1).toEqual(true);

            await wizardPage.typeToSearchInput('State');

            await wizardPage.waitForFieldAndMeasuresCount(1);

            fields = await wizardPage.getFields();

            expect(fields).toHaveLength(1);

            const [field] = fields;

            const fieldText = await field.innerText();

            expect(fieldText).toEqual('State');
        },
    );
});
