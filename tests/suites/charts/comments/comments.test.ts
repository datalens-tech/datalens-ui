import {Page} from '@playwright/test';

import {CHARTKIT_MENU_ITEMS_SELECTORS} from '../../../page-objects/wizard/ChartKit';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const SELECTORS = {
    comment: 'e2e-comment',
};

datalensTest.describe('Chart comments', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardWithComments);
    });
    datalensTest(
        'Default display of comments and necessary menu items when opening',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.chartkit.openChartMenu();

            // there is a menu item Comments
            await wizardPage.chartkit.waitForItemInMenu(
                CHARTKIT_MENU_ITEMS_SELECTORS.menuCommentsQA,
            );
            // there is a menu item Hide comments
            await wizardPage.chartkit.waitForItemInMenu(
                CHARTKIT_MENU_ITEMS_SELECTORS.menuHideCommentsQA,
            );

            // there is one added comment
            const comments = await wizardPage.chartkit.getComments();
            expect(comments).toHaveLength(1);

            // the comment caption is displayed on the graph
            const comment = wizardPage.page.getByText(SELECTORS.comment);
            await expect(comment).toBeVisible();
        },
    );
    datalensTest('Switching the display of comments', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        // hiding comments
        await wizardPage.chartkit.clickMenuItem(CHARTKIT_MENU_ITEMS_SELECTORS.menuHideCommentsQA);

        // check the number of rendered comments on the graph
        await waitForCondition(async () => {
            const comments = await wizardPage.chartkit.getComments();
            return comments.length === 0;
        });

        // showing comments
        await wizardPage.chartkit.clickMenuItem(CHARTKIT_MENU_ITEMS_SELECTORS.menuShowCommentsQA);

        // check the number of rendered comments on the graph
        await waitForCondition(async () => {
            const comments = await wizardPage.chartkit.getComments();
            return comments.length === 1;
        });
    });
});
