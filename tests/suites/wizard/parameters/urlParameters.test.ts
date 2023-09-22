import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {
    getXAxisValues,
    openTestPage,
    waitForCondition,
    waitForValidSearchParams,
} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - Parameters from URLParams', () => {
    datalensTest(
        'The field will be parsed as a parameter from URLParams, if such a field in the dataset is a parameter',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithParameterizedLocalField, {
                local_parameter: 'Technology',
            });

            await waitForCondition(async () => {
                const fields = await wizardPage.sectionVisualization.getPlaceholderItems(
                    PlaceholderName.DashboardParameters,
                );

                const textValues = await Promise.all(fields.map((field) => field.textContent()));

                return fields.length === 1 && textValues[0] === 'local_parameter: Technology';
            }).catch(() => {
                throw new Error('The parameter from URLParams has not appeared in the chart');
            });
        },
    );

    datalensTest(
        'The parameter from URLParams will overwrite the parameter value in the chart',
        async ({page, context}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithParameterizedLocalField);

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

            const parameterizedXAxisValuesWithUrlParameter = [
                'Furniture',
                'Office Supplies',
                'parameter_title',
            ];

            const secondPage: Page = await context.newPage();

            const secondWizardPage = new WizardPage({page: secondPage});

            await openTestPage(
                secondPage,
                RobotChartsWizardUrls.WizardWithParameterizedLocalField,
                {
                    local_parameter: 'Technology',
                },
            );

            await secondWizardPage.sectionVisualization.replaceFieldByDragAndDrop(
                PlaceholderName.X,
                'Category',
                'parameterized_field',
            );

            await waitForCondition(async () => {
                const xAxisValues = await getXAxisValues(secondPage);

                return xAxisValues.join(',') === parameterizedXAxisValuesWithUrlParameter.join(',');
            }).catch(() => {
                throw new Error(
                    'The parameter from URLParams has not appeared in the parameterized formula',
                );
            });
        },
    );

    datalensTest(
        'Removing a parameter from the Parameters section from the dashboard will remove the parameter from URLParams as well',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithParameterizedLocalField, {
                local_parameter: 'Technology',
            });

            await waitForValidSearchParams({
                page,
                error: 'URLParams do not contain the parameter',
                param: 'local_parameter',
                shouldIncludeParam: true,
            });

            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.DashboardParameters,
                'local_parameter',
            );

            await waitForValidSearchParams({
                page,
                error: 'The parameter from the dashboard has not been removed from URLParams',
                shouldIncludeParam: false,
                param: 'local_parameter',
            });
        },
    );
});
