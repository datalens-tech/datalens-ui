import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DatasetItemActionsQa} from '../../../../src/shared';

datalensTest.describe('Wizard Fields', () => {
    datalensTest(
        'Duplicate the field and delete it, deleting the field requires confirmation',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

            await waitForCondition(async () => {
                const fields = await wizardPage.getFields();
                const fieldsNames = await Promise.all(fields.map((field) => field.innerText()));

                return fieldsNames.includes('City') && !fieldsNames.includes('City (1)');
            });

            await wizardPage.callDatasetFieldAction('City', DatasetItemActionsQa.DuplicateField);

            await waitForCondition(async () => {
                const fields = await wizardPage.getFields();
                const fieldsNames = await Promise.all(fields.map((field) => field.innerText()));

                return fieldsNames.includes('City') && fieldsNames.includes('City (1)');
            });

            await wizardPage.callDatasetFieldAction('City (1)', DatasetItemActionsQa.RemoveField);

            await waitForCondition(async () => {
                const fields = await wizardPage.getFields();
                const fieldsNames = await Promise.all(fields.map((field) => field.innerText()));

                return fieldsNames.includes('City') && !fieldsNames.includes('City (1)');
            });
        },
    );
});
