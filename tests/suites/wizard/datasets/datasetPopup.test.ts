import {ElementHandle, Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition, slct} from '../../../utils';
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

            let popupWindow: ElementHandle<HTMLElement | SVGElement> | null;

            await waitForCondition(async () => {
                popupWindow = await wizardPage.page.$('.dl-core-navigation-minimal__popup');
                return popupWindow;
            }).catch(() => {
                throw new Error('A pop-up with a selection of datasets did not appear');
            });

            popupWindow = null;

            await wizardPage.page.click(slct(DlNavigationQA.AsideMenuItem));

            let viewNavigation: ElementHandle<SVGElement | HTMLElement> | null;

            await waitForCondition(async () => {
                viewNavigation = await wizardPage.page.$('.dl-core-navigation__view');
                popupWindow = await wizardPage.page.$('.dl-core-navigation-minimal__popup');
                return viewNavigation && !popupWindow;
            }).catch(() => {
                throw new Error(
                    `The sidebar appeared [${Boolean(
                        viewNavigation,
                    )}], and the pop-up has not disappeared [${Boolean(popupWindow)}]`,
                );
            });
        },
    );
});
