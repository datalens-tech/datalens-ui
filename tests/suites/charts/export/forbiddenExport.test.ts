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

    WIZARD_ENABLED_EXPORT_ITEMS_COUNT: 8,
    WIZARD_PREVIEW_ENABLED_EXPORT_ITEMS_COUNT: 10,

    QL_ENABLED_EXPORT_ITEMS_COUNT: 8,
    QL_PREVIEW_ENABLED_EXPORT_ITEMS_COUNT: 10,
};

datalensTest.describe('Chart export availability', () => {
    datalensTest.describe('Wizard with forbidden export', () => {
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
            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
            await openTestPage(page, RobotChartsSQLEditorUrls.QLWithForbiddenExport);
            await apiRunPromise;

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

    datalensTest.describe('Preview with forbidden export', () => {
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

        datalensTest(
            'Ql preview - Export menu item is disabled if export is forbidden on connection',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
                await openTestPage(page, RobotChartsPreviewUrls.PreviewQLWithForbiddenExport);
                await apiRunPromise;

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

    datalensTest.describe('Export available', () => {
        datalensTest(
            'Wizard preview - Export menu item is enabled, open as table menu item is enabled',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(
                    page,
                    RobotChartsPreviewUrls.PreviewWizardWithLocalParameterChart,
                );
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.WIZARD_PREVIEW_ENABLED_EXPORT_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).not.toBe('-1');
                expect(await openAsTableMenuItem.getAttribute('tabindex')).not.toBe('-1');
            },
        );
        datalensTest(
            'Wizard - Export menu item is enabled, open as table menu item is enabled',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(page, RobotChartsWizardUrls.WizardWithLocalParameterChart);
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.WIZARD_ENABLED_EXPORT_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).not.toBe('-1');
                expect(await openAsTableMenuItem.getAttribute('tabindex')).not.toBe('-1');
            },
        );

        datalensTest(
            'QL preview - Export menu item is enabled, open as table menu item is abcent',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
                await openTestPage(page, RobotChartsPreviewUrls.PreviewQLColumnChart);
                await apiRunPromise;

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.QL_PREVIEW_ENABLED_EXPORT_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).not.toBe('-1');
                expect(await openAsTableMenuItem.getAttribute('tabindex')).not.toBe('-1');
            },
        );
        datalensTest(
            'QL - Export menu item is enabled, open as table menu item is abcent',
            async ({page}: {page: Page}) => {
                const wizardPage = new WizardPage({page});
                const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
                await openTestPage(page, RobotChartsSQLEditorUrls.QLColumnChart);
                await apiRunPromise;

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.QL_ENABLED_EXPORT_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).not.toBe('-1');
                expect(await openAsTableMenuItem.getAttribute('tabindex')).not.toBe('-1');
            },
        );
    });
});
