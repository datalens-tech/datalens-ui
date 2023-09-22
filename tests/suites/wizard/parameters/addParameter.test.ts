import {Page} from '@playwright/test';

import {DialogParameterDataTypes} from '../../../page-objects/common/DialogParameter';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - Creating a local parameter', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardWithParameterDataset);
    });

    datalensTest('Adding a local parameter', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const PARAMETER_NAME = 'PARAMETER_NAME';
        const PARAMETER_TYPE = DialogParameterDataTypes.String;
        const PARAMETER_VALUE = 'false';

        await wizardPage.parameterEditor.openCreateParameter();

        await wizardPage.parameterEditor.setName(PARAMETER_NAME);

        await wizardPage.parameterEditor.selectType(PARAMETER_TYPE);

        await wizardPage.parameterEditor.setDefaultValue(PARAMETER_VALUE);

        await wizardPage.parameterEditor.apply();

        await waitForCondition(async () => {
            const parameters = await wizardPage.getFields('parameter');
            const parametersNames = await Promise.all(
                parameters.map((parameterNode) => parameterNode.textContent()),
            );

            return parameters.length === 2 && parametersNames.includes(PARAMETER_NAME);
        }).catch(() => {
            throw new Error('The parameter was not added');
        });
    });
});
