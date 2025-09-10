import {Page, expect} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {
    RobotChartsPreviewUrls,
    RobotChartsSQLEditorUrls,
    RobotChartsWizardUrls,
} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {MenuItemsIds} from '../../../../src/shared';

const PARAMS = {
    // the number of menu items of chart including separators with non-displayed export
    WIZARD_EDIT_MENU_ITEMS_COUNT: 7,
    WIZARD_PREVIEW_MENU_ITEMS_COUNT: 9,
    QL_EDIT_MENU_ITEMS_COUNT: 6,
    QL_PREVIEW_MENU_ITEMS_COUNT: 8,
};

datalensTest.describe('Chart with forbidden export', () => {
    datalensTest.describe('Wizard', () => {
        datalensTest(
            'Export menu item is disabled if export is forbidden on connection',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(
                    page,
                    RobotChartsWizardUrls.WizardWithForbiddenOnConnectionExport,
                );
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.WIZARD_EDIT_MENU_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
                expect(openAsTableMenuItem).not.toBeVisible();
            },
        );

        datalensTest(
            'Export menu item is disabled if export is forbidden on dataset',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(page, RobotChartsWizardUrls.WizardWithForbiddenOnDatasetExport);
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.WIZARD_EDIT_MENU_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
                expect(openAsTableMenuItem).not.toBeVisible();
            },
        );
    });

    datalensTest(
        'Ql - Export menu item is disabled if export is forbidden on connection',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.QLWithForbiddenExport);
            await wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.chartkit.openChartMenu();

            const menuItemsCount = await page
                .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                .count();

            const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
            const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

            expect(menuItemsCount).toEqual(PARAMS.QL_EDIT_MENU_ITEMS_COUNT);
            expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
            expect(openAsTableMenuItem).not.toBeVisible();
        },
    );

    datalensTest.describe('Preview', () => {
        datalensTest(
            'Wizard preview - Export menu item is disabled if export is forbidden on connection',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(
                    page,
                    RobotChartsPreviewUrls.PreviewWizardWithForbiddenOnConnectionExport,
                );
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.WIZARD_PREVIEW_MENU_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
                expect(openAsTableMenuItem).not.toBeVisible();
            },
        );

        datalensTest(
            'Wizard preview - Export menu item is disabled if export is forbidden on dataset',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(
                    page,
                    RobotChartsPreviewUrls.PreviewWizardWithForbiddenOnDatasetExport,
                );
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.WIZARD_PREVIEW_MENU_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
                expect(openAsTableMenuItem).not.toBeVisible();
            },
        );
        // TODO: unskip after CHARTS-11822
        datalensTest.skip(
            'Ql preview - Export menu item is disabled if export is forbidden on connection',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(page, RobotChartsPreviewUrls.PreviewQLWithForbiddenExport);
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.QL_PREVIEW_MENU_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
                expect(openAsTableMenuItem).not.toBeVisible();
            },
        );
    });
});
