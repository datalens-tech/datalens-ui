import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DatasetItemActionsQa} from '../../../../src/shared';

datalensTest.describe('Wizard - Parameter Editing', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardWithLocalParameterChart);
    });

    datalensTest('Deleting a local parameter', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const LOCAL_PARAMETER_NAME = 'local_parameter';

        await waitForCondition(async () => {
            const parameters = await wizardPage.getFields('parameter');
            const parametersNames = await Promise.all(parameters.map((p) => p.textContent()));

            return parameters.length === 2 && parametersNames.includes(LOCAL_PARAMETER_NAME);
        });

        await wizardPage.callDatasetFieldAction(
            LOCAL_PARAMETER_NAME,
            DatasetItemActionsQa.RemoveField,
        );

        await waitForCondition(async () => {
            const parameters = await wizardPage.getFields('parameter');
            const parametersNames = await Promise.all(parameters.map((p) => p.textContent()));

            return parameters.length === 1 && !parametersNames.includes(LOCAL_PARAMETER_NAME);
        }).catch(() => {
            throw new Error('The local parameter has not been deleted');
        });
    });
});
