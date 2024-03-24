import {expect} from '@playwright/test';

import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {WizardVisualizationId} from '../../../../src/shared';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Column Settings dialog', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'DATE',
        );
    });

    datalensTest('You can set the column width', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.columnSettings.open();

        let value = await wizardPage.columnSettings.getRadioButtonsValue('DATE');

        let inputValue = await wizardPage.columnSettings.getInputValue('DATE');

        expect(value).toEqual('auto');
        expect(inputValue).toEqual('—');

        await wizardPage.columnSettings.switchUnit('DATE', 'pixel');

        await wizardPage.columnSettings.fillWidthValueInput('DATE', '120');

        await wizardPage.columnSettings.apply();

        await wizardPage.columnSettings.open();

        value = await wizardPage.columnSettings.getRadioButtonsValue('DATE');
        inputValue = await wizardPage.columnSettings.getInputValue('DATE');

        expect(value).toEqual('pixel');
        expect(inputValue).toEqual('120');
    });

    datalensTest(
        'When resetting the settings in the dialog, resets the value to auto',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.columnSettings.open();

            await wizardPage.columnSettings.switchUnit('DATE', 'percent');

            await wizardPage.columnSettings.fillWidthValueInput('DATE', '12');

            let value = await wizardPage.columnSettings.getRadioButtonsValue('DATE');
            let inputValue = await wizardPage.columnSettings.getInputValue('DATE');

            expect(value).toEqual('percent');
            expect(inputValue).toEqual('12');

            await wizardPage.columnSettings.reset();

            value = await wizardPage.columnSettings.getRadioButtonsValue('DATE');
            inputValue = await wizardPage.columnSettings.getInputValue('DATE');

            expect(value).toEqual('auto');
            expect(inputValue).toEqual('—');
        },
    );

    datalensTest(
        'When setting the column width for the hierarchy, the width of the table cells changes',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            const hierarchyFieldName = 'Hierarchy column';
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.setName(hierarchyFieldName);
            await wizardPage.hierarchyEditor.selectFields(['Category', 'Sub-Category']);
            await wizardPage.hierarchyEditor.clickSave();

            let apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                hierarchyFieldName,
            );
            await (await apiRunRequest).response();

            const table = wizardPage.chartkit.getTableLocator();
            const hierarchyColumn = table.locator('th', {hasText: 'Category'}).first();
            const prev = await hierarchyColumn.boundingBox();

            apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );
            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit(hierarchyFieldName, 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput(hierarchyFieldName, '120');

            await wizardPage.columnSettings.apply();
            await (await apiRunRequest).response();

            const current = await hierarchyColumn.boundingBox();
            await expect(current?.width).not.toEqual(prev?.width);
        },
    );
});
