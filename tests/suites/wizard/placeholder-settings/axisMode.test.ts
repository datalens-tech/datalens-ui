import datalensTest from '../../../utils/playwright/globalTestDefinition';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {RadioButtons, RadioButtonsValues} from '../../../page-objects/wizard/PlaceholderDialog';
import {openTestPage} from '../../../utils';
import {
    AxisMode,
    DialogFieldAggregationSelectorValuesQa,
    PlaceholderId,
} from '../../../../src/shared';

datalensTest.describe('Wizard - Section Settings - Display Mode', () => {
    datalensTest.beforeEach(async ({page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);
    });

    datalensTest(
        'When adding a field of the Date type, the Continuous mode must be set',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'DATE');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            const selectedMode = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );

            expect(selectedMode).toEqual(AxisMode.Continuous);
        },
    );

    datalensTest(
        'When adding a field of type Number, the Continuous mode must be set',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Year');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            const selectedMode = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );

            expect(selectedMode).toEqual(AxisMode.Continuous);
        },
    );

    datalensTest(
        'When adding a field of the String type, the Discrete mode must be set',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            const selectedMode = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );

            expect(selectedMode).toEqual(AxisMode.Discrete);
        },
    );

    datalensTest('When deleting a field, the axis mode is reset', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'DATE');

        await wizardPage.placeholderDialog.open(PlaceholderId.X);

        await wizardPage.placeholderDialog.toggleRadioButton(
            RadioButtons.AxisMode,
            RadioButtonsValues.Discrete,
        );

        await wizardPage.placeholderDialog.apply();

        await wizardPage.placeholderDialog.open(PlaceholderId.X);

        let selectedValue = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
            RadioButtons.AxisMode,
        );

        expect(selectedValue).toEqual(AxisMode.Discrete);

        await wizardPage.placeholderDialog.close();

        await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.X, 'DATE');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'DATE');

        await wizardPage.placeholderDialog.open(PlaceholderId.X);

        selectedValue = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
            RadioButtons.AxisMode,
        );

        expect(selectedValue).toEqual(AxisMode.Continuous);
    });

    datalensTest(
        'When switching the hierarchy, a different mode will be selected for each field',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.openHierarchyEditor();

            await wizardPage.hierarchyEditor.selectFields(['DATE', 'Category', 'Year']);

            await wizardPage.hierarchyEditor.setName('Test');

            await wizardPage.hierarchyEditor.clickSave();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Test');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            let selectedMode = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );
            // First level field with type date ([DATE]) (must be continuous mode).
            expect(selectedMode).toEqual(AxisMode.Continuous);

            await wizardPage.placeholderDialog.close();

            await wizardPage.chartkit.drillDown();

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            selectedMode = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );

            // The second level is a field with the type string ([Category]) (there must be a discrete mode).
            expect(selectedMode).toEqual(AxisMode.Discrete);

            await wizardPage.placeholderDialog.close();

            await wizardPage.chartkit.drillDown();

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            selectedMode = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );

            // The third level is a field with the type number ([Year]) (must be continuous mode).
            expect(selectedMode).toEqual(AxisMode.Continuous);

            await wizardPage.placeholderDialog.close();
        },
    );

    datalensTest(
        'Saves the selected mode when switching between hierarchy levels',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.openHierarchyEditor();

            await wizardPage.hierarchyEditor.selectFields(['DATE', 'Year']);

            await wizardPage.hierarchyEditor.setName('Test');

            await wizardPage.hierarchyEditor.clickSave();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Test');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AxisMode,
                RadioButtonsValues.Discrete,
            );

            await wizardPage.placeholderDialog.apply();

            await wizardPage.chartkit.drillDown();

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            let selectedValue = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );

            // Second level, field with type number ([Year]). There must be a continuous mode
            expect(selectedValue).toEqual(AxisMode.Continuous);

            await wizardPage.placeholderDialog.close();

            await wizardPage.chartkit.drillUp();

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            selectedValue = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );

            // First level, a field with the date ([DATE]) type. Since the discrete mode was selected, it should be preserved
            expect(selectedValue).toEqual(AxisMode.Discrete);
        },
    );

    datalensTest(
        'When data aggregation is used, it is necessary to set continuous mode for the date field',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'DATE');
            await wizardPage.visualizationItemDialog.open(PlaceholderName.X, 'DATE');
            await wizardPage.visualizationItemDialog.setAggregation(
                DialogFieldAggregationSelectorValuesQa.Max,
            );
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            const selectedMode = await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(
                RadioButtons.AxisMode,
            );

            expect(selectedMode).toEqual(AxisMode.Continuous);
        },
    );
});
