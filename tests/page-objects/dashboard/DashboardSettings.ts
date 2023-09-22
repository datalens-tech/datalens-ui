import {Page} from '@playwright/test';

import {slct, waitForCondition} from '../../utils';

import DashboardPage from './DashboardPage';
import {
    DashboardActionPanelControlsQa,
    DashboardDialogSettingsQa,
} from '../../../src/shared/constants/qa/dash';

export default class DashboardSettings {
    static selectors = {
        openSettingsBtn: slct(DashboardActionPanelControlsQa.SettingsButton),
        settingsDialog: slct(DashboardDialogSettingsQa.DialogRoot),
        closeSettingsBtn: slct(DashboardDialogSettingsQa.CancelButton),
        saveSettingsBtn: slct(DashboardDialogSettingsQa.ApplyButton),
    };

    page: Page;
    dashPage: DashboardPage;

    constructor(page: Page, dashPage: DashboardPage) {
        this.page = page;
        this.dashPage = dashPage;
    }

    async opened() {
        await this.page.waitForSelector(DashboardSettings.selectors.settingsDialog);
    }

    async closed() {
        await waitForCondition(async () => {
            const elements = await this.page.$$(DashboardSettings.selectors.settingsDialog);

            return elements.length < 1;
        });
    }

    async open() {
        const settingsButton = await this.page.waitForSelector(
            DashboardSettings.selectors.openSettingsBtn,
        );
        await settingsButton.click();
        await this.opened();
    }

    async close() {
        const closeButton = await this.page.waitForSelector(
            DashboardSettings.selectors.closeSettingsBtn,
        );
        await closeButton.click();
        // we are waiting for the absence of the settings dialog on the page
        await this.closed();
    }

    async save() {
        const saveButton = await this.page.waitForSelector(
            DashboardSettings.selectors.saveSettingsBtn,
        );
        await saveButton.click();
        // we are waiting for the absence of the settings dialog on the page
        await this.closed();
    }
}
