import {Page} from '@playwright/test';
import {slct} from '../../utils';
import {getValidatePromise} from './utils';
import {
    AvatarQA,
    DatasetSourcesLeftPanelQA,
    DatasetSourcesTableQa,
    ValueOf,
} from '../../../src/shared';
import {SET_CONNECTION_METHODS} from './constants';

export type SetConnectionProps = {
    connectionName: string;
    method: ValueOf<typeof SET_CONNECTION_METHODS>;
};

export default class DatasetConnectionSection {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async openCurrentConnection() {
        const newTabPagePromise: Promise<Page> = new Promise((resolve) =>
            this.page.context().on('page', resolve),
        );
        const contextMenu = await this.page.waitForSelector(
            slct(DatasetSourcesLeftPanelQA.ConnContextMenuBtn),
        );
        await contextMenu.click();
        const openConnectionBtn = await this.page.waitForSelector(
            slct(DatasetSourcesLeftPanelQA.ConnContextMenuOpen),
        );
        await openConnectionBtn.click();
        const newPage = await newTabPagePromise;
        return newPage;
    }

    async openConnectionSelectViaMethod(method: SetConnectionProps['method']) {
        switch (method) {
            case SET_CONNECTION_METHODS.ADD: {
                await this.addConnection();
                break;
            }
            case SET_CONNECTION_METHODS.REPLACE: {
                await this.replaceConnection();
                break;
            }
            case SET_CONNECTION_METHODS.DELETE: {
                await this.deleteConnection();
                await this.addConnection();
                break;
            }
        }
    }

    async deleteConnection() {
        await this.page.waitForSelector(slct(AvatarQA.Avatar));
        await this.page.waitForSelector(slct(DatasetSourcesTableQa.Source));
        const deleteAvatarSelector = slct(AvatarQA.DeleteButton);
        const sourceMenuSelector = slct(DatasetSourcesTableQa.SourceContextMenuBtn);

        // delete all avatars
        while ((await this.page.locator(deleteAvatarSelector).count()) > 0) {
            const validatePromise = getValidatePromise(this.page);
            await this.page.locator(deleteAvatarSelector).first().click();
            await validatePromise;
        }
        // delete all sources
        while ((await this.page.locator(sourceMenuSelector).count()) > 0) {
            await this.page.locator(sourceMenuSelector).first().click();
            const validatePromise = getValidatePromise(this.page);
            await this.page
                .locator(slct(DatasetSourcesTableQa.SourceContextMenuDelete))
                .first()
                .click();
            await validatePromise;
        }

        const contextMenu = await this.page.waitForSelector(
            slct(DatasetSourcesLeftPanelQA.ConnContextMenuBtn),
        );
        await contextMenu.click();
        const deleteBtn = await this.page.waitForSelector(
            slct(DatasetSourcesLeftPanelQA.ConnContextMenuDelete),
        );
        await deleteBtn.click();
    }

    private async addConnection() {
        const connSelectionButton = await this.page.waitForSelector(
            slct(DatasetSourcesLeftPanelQA.ConnSelection),
        );
        await connSelectionButton.click();
    }

    private async replaceConnection() {
        const contextMenu = await this.page.waitForSelector(
            slct(DatasetSourcesLeftPanelQA.ConnContextMenuBtn),
        );
        await contextMenu.click();
        const replaceBtn = await this.page.waitForSelector(
            slct(DatasetSourcesLeftPanelQA.ConnContextMenuReplace),
        );
        await replaceBtn.click();
    }
}
