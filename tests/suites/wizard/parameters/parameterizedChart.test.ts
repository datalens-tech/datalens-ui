import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {getXAxisValues, openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - Parameterized chart', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardWithParameterizedLocalField);
    });

    datalensTest('Parameterized field affects chart', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const initialXAxisValues = ['Furniture', 'Office Supplies', 'Technology'];

        await waitForCondition(async () => {
            const xAxisValues = await getXAxisValues(page);

            return xAxisValues.join(',') === initialXAxisValues.join(',');
        });

        await wizardPage.sectionVisualization.replaceFieldByDragAndDrop(
            PlaceholderName.X,
            'Category',
            'parameterized_field',
        );

        const parameterizedXAxisValues = ['Office Supplies', 'parameter_title', 'Technology'];

        await waitForCondition(async () => {
            const xAxisValues = await getXAxisValues(page);

            return xAxisValues.join(',') === parameterizedXAxisValues.join(',');
        });
    });
});
