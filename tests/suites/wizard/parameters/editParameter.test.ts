import {Page, expect} from '@playwright/test';
import {DialogParameterQA, SectionDatasetQA} from '../../../../src/shared/constants';

import {DialogParameterDataTypes} from '../../../page-objects/common/DialogParameter';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

// Subscribe to the validateDataset request and to errors in the console.
// To be sure that the request passed and validation did not fall. That is, the field was updated correctly.
function subscribeOnParameterUpdate(page: Page) {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    const waitForResponsePromise = page.waitForResponse((response) => {
        return response.finished().then(() => response.url().endsWith('/validateDataset'));
    });

    return {
        consoleErrors,
        waitForResponsePromise,
    };
}

async function validateEditedDatasetParameter(parameterName: string, wizardPage: WizardPage) {
    try {
        const section = slct(SectionDatasetQA.SectionParameters);
        const field = slct(parameterName);

        await waitForCondition(async () => {
            return await wizardPage.page.$(`${section} ${field}`);
        }).catch(() => {
            throw new Error(`Field ${field} not found`);
        });

        const parameterItem = await wizardPage.page.locator(`${section} ${field}`);

        const classNames = await parameterItem.getAttribute('class');

        expect(classNames).toBeTruthy();
        expect(classNames).not.toContain('local-item');

        const iconsContainerSelector = '.wizard-dataset-item__item-right-icons-container';
        const iconEditedDatasetParameterSelector = '.wizard-dataset-item__item-formula-icon';

        const icon = await wizardPage.page.$(
            `${section} ${field} ${iconsContainerSelector} ${iconEditedDatasetParameterSelector}`,
        );

        expect(icon).not.toEqual(null);
    } catch (err) {
        await wizardPage.deleteEntry();
        throw err;
    }
}

datalensTest.describe('Wizard - Parameter Editing', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardWithLocalParameterChart);
    });

    datalensTest('Editing a local parameter', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const LOCAL_PARAMETER_NAME = 'local_parameter';
        const UPDATED_PARAMETER_NAME = 'updated_local_parameter';
        const UPDATED_PARAMETER_TYPE = DialogParameterDataTypes.Int;
        const UPDATED_PARAMETER_VALUE = '123';

        await wizardPage.parameterEditor.openEditParameter(LOCAL_PARAMETER_NAME);

        await wizardPage.parameterEditor.setName(UPDATED_PARAMETER_NAME);

        await wizardPage.parameterEditor.selectType(UPDATED_PARAMETER_TYPE);

        await wizardPage.parameterEditor.setDefaultValue(UPDATED_PARAMETER_VALUE);

        const {consoleErrors, waitForResponsePromise} = subscribeOnParameterUpdate(page);

        await wizardPage.parameterEditor.apply();

        await waitForResponsePromise;

        expect(consoleErrors).toHaveLength(0);

        const fields = await wizardPage.getFields('parameter');
        const fieldNames = await Promise.all(fields.map((field) => field.textContent()));

        expect(fieldNames).not.toContain(LOCAL_PARAMETER_NAME);
        expect(fieldNames).toContain(UPDATED_PARAMETER_NAME);
    });

    datalensTest('Editing a parameter from a dataset', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const DATASET_PARAMETER_NAME = 'test_parameter';
        const NEW_DEFAULT_VALUE = 'default_value_2';

        await wizardPage.parameterEditor.openEditParameter(DATASET_PARAMETER_NAME);

        const nameInput = await wizardPage.parameterEditor.getEditorInput(
            DialogParameterQA.NameInput,
        );

        const selectInput = await wizardPage.parameterEditor.getEditorInput(
            DialogParameterQA.TypeSelector,
        );

        const defaultValueInput = await wizardPage.parameterEditor.getEditorInput(
            DialogParameterQA.DefaultValueInput,
        );

        const initialDefaultValue = await defaultValueInput.inputValue();

        // When editing a parameter from a dataset, you can only change the default value.
        // The rest of the inputs must be secured
        await expect(nameInput).toBeDisabled();

        await expect(selectInput).toBeDisabled();

        await expect(defaultValueInput).not.toBeDisabled();

        await wizardPage.parameterEditor.setDefaultValue(NEW_DEFAULT_VALUE);

        const {consoleErrors, waitForResponsePromise} = subscribeOnParameterUpdate(page);

        await wizardPage.parameterEditor.apply();

        await waitForResponsePromise;

        expect(consoleErrors).toHaveLength(0);

        await wizardPage.parameterEditor.openEditParameter(DATASET_PARAMETER_NAME);

        const updatedDefaultValueInput = await wizardPage.parameterEditor.getEditorInput(
            DialogParameterQA.DefaultValueInput,
        );

        const updatedDefaultValue = await updatedDefaultValueInput.inputValue();

        expect(updatedDefaultValue).not.toEqual(initialDefaultValue);
        expect(updatedDefaultValue).toEqual(NEW_DEFAULT_VALUE);
    });

    datalensTest(
        'The edited dataset parameter must contain a special icon and not be local',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.saveWizardAsNew(
                wizardPage.getUniqueEntryName('wizard-e2e-parameter-test'),
            );

            const DATASET_PARAMETER_NAME = 'test_parameter';
            const NEW_DEFAULT_VALUE = 'default_value_2';

            await wizardPage.parameterEditor.openEditParameter(DATASET_PARAMETER_NAME);

            await wizardPage.parameterEditor.setDefaultValue(NEW_DEFAULT_VALUE);

            const {consoleErrors, waitForResponsePromise} = subscribeOnParameterUpdate(page);

            await wizardPage.parameterEditor.apply();

            await waitForResponsePromise;

            expect(consoleErrors).toHaveLength(0);

            await validateEditedDatasetParameter(DATASET_PARAMETER_NAME, wizardPage);

            await wizardPage.saveExistentWizardEntry();

            await wizardPage.page.reload();

            await wizardPage.page.waitForNavigation();

            await validateEditedDatasetParameter(DATASET_PARAMETER_NAME, wizardPage);

            await wizardPage.deleteEntry();
        },
    );

    datalensTest(
        'Reset parameter from dataset to default value, must reset default value to value from dataset',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const DATASET_PARAMETER_NAME = 'test_parameter';
            const INITIAL_DEFAULT_VALUE = 'test';
            const NEW_DEFAULT_VALUE = 'default_value_2';

            await wizardPage.parameterEditor.openEditParameter(DATASET_PARAMETER_NAME);

            await wizardPage.parameterEditor.setDefaultValue(NEW_DEFAULT_VALUE);

            const {consoleErrors, waitForResponsePromise} = subscribeOnParameterUpdate(page);

            await wizardPage.parameterEditor.apply();

            await waitForResponsePromise;

            expect(consoleErrors).toHaveLength(0);

            await wizardPage.parameterEditor.openEditParameter(DATASET_PARAMETER_NAME);

            await wizardPage.parameterEditor.reset();

            const {consoleErrors: consoleErrors2, waitForResponsePromise: waitForResponsePromise2} =
                subscribeOnParameterUpdate(page);

            await wizardPage.parameterEditor.apply();

            await waitForResponsePromise2;

            expect(consoleErrors2).toHaveLength(0);

            await wizardPage.parameterEditor.openEditParameter(DATASET_PARAMETER_NAME);

            const initialDefaultValueInput = await wizardPage.parameterEditor.getEditorInput(
                DialogParameterQA.DefaultValueInput,
            );

            const initialDefaultValue = await initialDefaultValueInput.inputValue();

            expect(initialDefaultValue).toEqual(INITIAL_DEFAULT_VALUE);
        },
    );
});
