import {Page, expect} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {MenuItemsIds} from '../../../../src/shared';
import type {TestParametrizationConfig} from '../../../types/config';

const PARAMS = {
    // the number of menu items of chart including separators with non-displayed export
    WIZARD_EDIT_MENU_ITEMS_COUNT: 5,
    WIZARD_PREVIEW_MENU_ITEMS_COUNT: 7,
    QL_EDIT_MENU_ITEMS_COUNT: 5,
    QL_PREVIEW_MENU_ITEMS_COUNT: 7,

    WIZARD_ENABLED_EXPORT_ITEMS_COUNT: 6,
    WIZARD_PREVIEW_ENABLED_EXPORT_ITEMS_COUNT: 8,

    QL_ENABLED_EXPORT_ITEMS_COUNT: 6,
    QL_PREVIEW_ENABLED_EXPORT_ITEMS_COUNT: 8,
};

datalensTest.describe('Chart export availability', () => {
    datalensTest.describe('Wizard with forbidden export', () => {
        datalensTest(
            'Export menu item is disabled if export is forbidden on connection',
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(page, config.charts.urls.WizardWithForbiddenOnConnectionExport);
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.WIZARD_EDIT_MENU_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
                await expect(openAsTableMenuItem).toHaveCount(0);
            },
        );

        datalensTest(
            'Export menu item is disabled if export is forbidden on dataset',
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(page, config.charts.urls.WizardWithForbiddenOnDatasetExport);
                await wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.WIZARD_EDIT_MENU_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
                await expect(openAsTableMenuItem).toHaveCount(0);
            },
        );
    });

    datalensTest(
        'Ql - Export menu item is disabled if export is forbidden on connection',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const wizardPage = new WizardPage({page});
            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
            await openTestPage(page, config.charts.urls.QLWithForbiddenOnConnectionExport);
            await apiRunPromise;

            await wizardPage.chartkit.openChartMenu();

            const menuItemsCount = await page
                .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                .count();

            const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
            const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

            expect(menuItemsCount).toEqual(PARAMS.QL_EDIT_MENU_ITEMS_COUNT);
            expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
            await expect(openAsTableMenuItem).toHaveCount(0);
        },
    );

    datalensTest.describe('Preview with forbidden export', () => {
        datalensTest(
            'Wizard preview - Export menu item is disabled if export is forbidden on connection',
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(
                    page,
                    config.charts.urls.PreviewWizardWithForbiddenOnConnectionExport,
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
                await expect(openAsTableMenuItem).toHaveCount(0);
            },
        );

        datalensTest(
            'Wizard preview - Export menu item is disabled if export is forbidden on dataset',
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(
                    page,
                    config.charts.urls.PreviewWizardWithForbiddenOnDatasetExport,
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
                await expect(openAsTableMenuItem).toHaveCount(0);
            },
        );

        datalensTest(
            'Ql preview - Export menu item is disabled if export is forbidden on connection',
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
                await openTestPage(page, config.charts.urls.PreviewQLWithForbiddenExport);
                await apiRunPromise;

                await wizardPage.chartkit.openChartMenu();

                const menuItemsCount = await page
                    .locator(`${slct(ChartkitMenuDialogsQA.chartMenuDropDown)} > li`)
                    .count();

                const exportMenuItem = page.locator(slct(MenuItemsIds.EXPORT));
                const openAsTableMenuItem = page.locator(slct(MenuItemsIds.OPEN_AS_TABLE));

                expect(menuItemsCount).toEqual(PARAMS.QL_PREVIEW_MENU_ITEMS_COUNT);
                expect(await exportMenuItem.getAttribute('tabindex')).toBe('-1');
                await expect(openAsTableMenuItem).toHaveCount(0);
            },
        );
    });

    datalensTest.describe('Export available', () => {
        datalensTest(
            'Wizard preview - Export menu item is enabled, open as table menu item is enabled',
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(page, config.charts.urls.PreviewWizardWithEnabledExport);
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
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                await openTestPage(page, config.charts.urls.WizardWithEnabledExport);
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
            'QL preview - Export menu item is enabled, open as table menu item is enabled',
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
                await openTestPage(page, config.charts.urls.PreviewQLColumnChart);
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
            'QL - Export menu item is enabled, open as table menu item is enabled',
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const wizardPage = new WizardPage({page});
                const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
                await openTestPage(page, config.charts.urls.QLColumnChart);
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
