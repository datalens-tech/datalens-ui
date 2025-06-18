import {expect, Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import {DlNavigationQA} from '../../../../src/shared';

datalensTest.describe('Wizard - Pop-up for adding dataset', () => {
    datalensTest(
        'The popup should close when you click on SVG in the side menu',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.Empty);

            await wizardPage.datasetSelector.click();

            const navigationPopup = page.locator(slct('navigation-minimal'));
            await expect(navigationPopup).toBeVisible();

            await wizardPage.page.locator(slct(DlNavigationQA.AsideMenuItem)).click();

            const viewNavigation = page.locator('.dl-core-navigation__view');

            await expect(viewNavigation).toBeVisible();
            await expect(navigationPopup).not.toBeVisible();
        },
    );
});
