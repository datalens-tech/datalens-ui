import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

async function getFieldByFieldName(wizardPage: WizardPage, fieldName: string) {
    const fields = await wizardPage.getFields();

    for (const field of fields) {
        const fieldText = await field.innerText();

        if (fieldText === fieldName) {
            return field;
        }
    }

    return;
}

async function waitForValidField(wizardPage: WizardPage, fieldName: string) {
    await waitForCondition(async () => {
        const field = await getFieldByFieldName(wizardPage, fieldName);

        if (!field) {
            return;
        }

        const fieldClassName = (await field.evaluate((e) => e.className)) || '';

        return !fieldClassName.includes('item-error');
    });
}

async function waitForInvalidField(wizardPage: WizardPage, fieldName: string) {
    await waitForCondition(async () => {
        const field = await getFieldByFieldName(wizardPage, fieldName);

        if (!field) {
            return;
        }

        const fieldClassName = (await field.evaluate((e) => e.className)) || '';

        return fieldClassName.includes('item-error');
    });
}

datalensTest.describe('Wizard Fields', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.fieldEditor.open();
    });

    datalensTest(
        'Creating a formula field through formula editing',
        async ({page}: {page: Page}) => {
            const newFieldName = 'New city field';

            const wizardPage = new WizardPage({page});

            await wizardPage.fieldEditor.setName(newFieldName);

            await wizardPage.fieldEditor.setFormula('[City]');

            await wizardPage.fieldEditor.clickToApplyButton();

            await waitForValidField(wizardPage, newFieldName);
        },
    );

    datalensTest(
        'Creating a formula field through field selection',
        async ({page}: {page: Page}) => {
            const newFieldName = 'New city field';

            const wizardPage = new WizardPage({page});

            await wizardPage.fieldEditor.setName(newFieldName);

            await wizardPage.fieldEditor.selectField('City');

            await wizardPage.fieldEditor.clickToApplyButton();

            await waitForValidField(wizardPage, newFieldName);
        },
    );

    datalensTest(
        'Creating a formula field that turns out to be invalid',
        async ({page}: {page: Page}) => {
            const newFieldName = 'New city field';

            const wizardPage = new WizardPage({page});

            await wizardPage.fieldEditor.setName(newFieldName);

            await wizardPage.fieldEditor.setFormula('invalid formula');

            await wizardPage.fieldEditor.clickToApplyButton();

            await waitForInvalidField(wizardPage, newFieldName);
        },
    );
});

datalensTest.describe('Wizard - Parameterized fields', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardWithLocalParameterChart);

        await wizardPage.fieldEditor.open();
    });

    datalensTest('Creating a formula field with a parameter', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const parameterizedFieldName = 'PARAMETERIZED_FIELD';

        await wizardPage.fieldEditor.setName(parameterizedFieldName);

        await wizardPage.fieldEditor.setFormula(
            "case [Category] when [local_parameter] then 'parameter_title' else [Category] end",
        );

        await wizardPage.fieldEditor.clickToApplyButton();

        await waitForValidField(wizardPage, parameterizedFieldName);
    });
});
