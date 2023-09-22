import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const getAllPlaceholderItems = async (wizardPage: WizardPage) => {
    return await Promise.all([
        ...(await wizardPage.sectionVisualization.getPlaceholderItems(PlaceholderName.X)),
        ...(await wizardPage.sectionVisualization.getPlaceholderItems(PlaceholderName.Y)),
        ...(await wizardPage.sectionVisualization.getPlaceholderItems(PlaceholderName.Y2)),
    ]);
};

datalensTest.describe('Wizard Fields', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Sales');
    });

    datalensTest(
        "Changing Y's title should not affect other fields",
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            const expectedXPlaceholderFieldName = 'Category';
            const expectedYPlaceholderFieldName = 'Profit-Changed';
            const expectedY2PlaceholderFieldName = 'Sales';

            const expectedResult = [
                expectedXPlaceholderFieldName,
                expectedYPlaceholderFieldName,
                expectedY2PlaceholderFieldName,
            ].join();

            let actualResult = '';

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Y, 'Profit');

            await wizardPage.visualizationItemDialog.changeTitle('Profit-Changed');

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await waitForCondition(async () => {
                const placeholderItems = await getAllPlaceholderItems(wizardPage);

                const fieldNames = await Promise.all(placeholderItems.map((el) => el.innerText()));

                actualResult = fieldNames.join();

                return actualResult === expectedResult;
            }).catch((error) => {
                console.error(error);

                throw new Error(
                    `expectedResult: ${expectedResult} !== actualResult: ${actualResult}`,
                );
            });
        },
    );

    datalensTest(
        'Changing the title of Y2, should not affect other fields',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            const expectedXPlaceholderFieldName = 'Category';
            const expectedYPlaceholderFieldName = 'Profit';
            const expectedY2PlaceholderFieldName = 'Sales-Changed';

            const expectedResult = [
                expectedXPlaceholderFieldName,
                expectedYPlaceholderFieldName,
                expectedY2PlaceholderFieldName,
            ].join();

            let actualResult = '';

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Y2, 'Sales');

            await wizardPage.visualizationItemDialog.changeTitle('Sales-Changed');

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await waitForCondition(async () => {
                const placeholderItems = await getAllPlaceholderItems(wizardPage);

                const fieldNames = await Promise.all(placeholderItems.map((el) => el.innerText()));

                actualResult = fieldNames.join();

                return actualResult === expectedResult;
            }).catch((error) => {
                console.error(error);

                throw new Error(
                    `expectedResult: ${expectedResult} !== actualResult: ${actualResult}`,
                );
            });
        },
    );
});
