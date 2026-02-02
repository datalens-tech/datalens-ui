import {v1 as uuidv1} from 'uuid';
import {
    DialogCreateWorkbookEntryQa,
    EntryDialogQA,
} from '../../../src/shared/constants/qa/components';
import {
    DatasetPanelQA,
    DatasetActionQA,
    DatasetSourcesTableQa,
    DatasetSourcesLeftPanelQA,
    AvatarQA,
} from '../../../src/shared/constants/qa/datasets';

import {deleteEntity, slct} from '../../utils';
import {BasePage, BasePageProps} from '../BasePage';
import DialogParameter from '../common/DialogParameter';

import DatasetTabSection from './DatasetTabSection';
import {
    DialogCollectionStructureQa,
    SharedEntriesBaseQa,
    SharedEntriesPermissionsDialogQa,
    ValueOf,
} from '../../../src/shared';
import {Page, Response} from '@playwright/test';

export interface DatasetPageProps extends BasePageProps {}

export const waitForBiValidateDatasetResponses = (page: Page, timeout: number): Promise<void> => {
    return new Promise((resolve: any) => {
        const timerId = setTimeout(() => {
            page.off('response', onResponse);
            resolve();
        }, timeout);

        async function onResponse(response: Response) {
            if (!response.url().match('validateDataset')) {
                return;
            }

            const request = await response.request();
            const requestData = JSON.parse(request.postData() || '');

            // When the page loads, the validation request with empty updates initially goes away
            // We are only interested in the one that leaves after the avatar is deleted
            if (!requestData.data.updates.length) {
                return;
            }

            clearTimeout(timerId);

            if (response.status() !== 200) {
                throw new Error(
                    'After deleting the avatar, the dataset validation returned an error',
                );
            }

            resolve();
        }

        page.on('response', onResponse);
    });
};

export const SET_CONNECTION_METHODS = {
    ADD: 'add',
    REPLACE: 'replace',
    DELETE: 'delete',
} as const;

class DatasetPage extends BasePage {
    datasetTabSection: DatasetTabSection;
    dialogParameter: DialogParameter;

    constructor({page}: DatasetPageProps) {
        super({page});

        this.datasetTabSection = new DatasetTabSection(page);
        this.dialogParameter = new DialogParameter(page);
    }

    async addAvatarByDragAndDrop(sourceTitle?: string) {
        const selector = sourceTitle
            ? `${slct(DatasetSourcesTableQa.Source)} span >> text=${sourceTitle}`
            : slct(DatasetSourcesTableQa.Source);

        const source = await this.page.$(selector);

        if (!source) {
            throw new Error("Couldn't find the table");
        }

        const targetSelector = slct('ds-relations-map');
        const target = await this.page.$(targetSelector);

        if (!target) {
            throw new Error("Couldn't find an area to drag");
        }

        await this.page.dragAndDrop(selector, targetSelector);
    }

    async openSourcesPanel() {
        await this.page.click('.dataset-panel input[value=sources]');
    }

    async createDatasetInWorkbookOrCollection({
        name = uuidv1(),
        collectionId,
    }: {name?: string; collectionId?: string} = {}) {
        const dsCreateBtn = this.page.locator(slct(DatasetActionQA.CreateButton));
        await dsCreateBtn.click();

        const textInput = this.page
            .locator(slct(DialogCreateWorkbookEntryQa.Input))
            .locator('input');
        // clear input
        await textInput.press('Meta+A');
        await textInput.press('Backspace');
        // type dataset name
        await textInput.fill(name);
        const dialogApplyButton = await this.page.waitForSelector(
            slct(DialogCreateWorkbookEntryQa.ApplyButton),
        );
        // create connection
        await dialogApplyButton.click();
        try {
            if (collectionId) {
                await this.page.waitForURL(() => {
                    return this.page.url().endsWith(collectionId);
                });
            } else {
                await this.page.waitForURL(() => {
                    return this.page.url().includes(name);
                });
            }
            return name;
        } catch {
            throw new Error("Dataset wasn't created");
        }
    }

    async createDatasetInFolder({name = uuidv1()}: {name?: string} = {}) {
        // open creation dialog
        await this.page.locator(slct(DatasetActionQA.CreateButton)).click();
        // type dataset name
        await this.page.locator(slct(EntryDialogQA.PathSelect)).locator('input').fill(name);
        const dialogApplyButton = await this.page.waitForSelector(slct(EntryDialogQA.Apply));
        // create dataset
        await dialogApplyButton.click();
        try {
            await this.page.waitForURL(() => this.page.url().includes(name));
        } catch {
            throw new Error("Dataset wasn't created");
        }
    }

    async deleteEntry() {
        await deleteEntity(this.page);
    }

    async getCurrentTabName() {
        const input = await this.page.waitForSelector(
            `${slct(DatasetPanelQA.TabRadio)} input[aria-checked="true"]`,
        );

        return await input.inputValue();
    }

    async setConnectionDelegation({
        delegation = true,
    }: {
        delegation?: boolean;
    } = {}) {
        if (delegation) {
            const delegateBtn = await this.page.waitForSelector(
                slct(SharedEntriesPermissionsDialogQa.DelegateBtn),
            );
            await delegateBtn.click();
        } else {
            const delegateBtn = await this.page.waitForSelector(
                slct(SharedEntriesPermissionsDialogQa.NotDelegateBtn),
            );
            await delegateBtn.click();
        }

        const delegationApplyBtn = this.page.locator(
            slct(SharedEntriesPermissionsDialogQa.ApplyBtn),
        );
        await delegationApplyBtn.click();
    }

    async saveSharedDataset({name, collectionId}: {name?: string; collectionId: string}) {
        await this.page.waitForSelector(slct(DatasetSourcesTableQa.Source));

        await this.addAvatarByDragAndDrop();

        const dsName = await this.createDatasetInWorkbookOrCollection({
            collectionId,
            name,
        });

        return dsName;
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

    async setSharedConnection({
        connectionName,
        method,
    }: {
        connectionName: string;
        method: ValueOf<typeof SET_CONNECTION_METHODS>;
    }) {
        switch (method) {
            case SET_CONNECTION_METHODS.ADD: {
                const connSelectionButton = await this.page.waitForSelector(
                    slct(DatasetSourcesLeftPanelQA.ConnSelection),
                );
                await connSelectionButton.click();
                break;
            }
            case SET_CONNECTION_METHODS.REPLACE: {
                const contextMenu = await this.page.waitForSelector(
                    slct(DatasetSourcesLeftPanelQA.ConnContextMenuBtn),
                );
                await contextMenu.click();
                const replaceBtn = await this.page.waitForSelector(
                    slct(DatasetSourcesLeftPanelQA.ConnContextMenuReplace),
                );
                await replaceBtn.click();
                break;
            }
            case SET_CONNECTION_METHODS.DELETE: {
                await this.page.waitForSelector(slct(AvatarQA.Avatar));
                await this.page.waitForSelector(slct(DatasetSourcesTableQa.Source));
                const deleteAvatarSelector = slct(AvatarQA.DeleteButton);
                const sourceMenuSelector = slct(DatasetSourcesTableQa.SourceContextMenuBtn);

                // delete all avatars
                while ((await this.page.locator(deleteAvatarSelector).count()) > 0) {
                    await this.page.locator(deleteAvatarSelector).first().click();
                    await waitForBiValidateDatasetResponses(this.page, 5000);
                }
                // delete all sources
                while ((await this.page.locator(sourceMenuSelector).count()) > 0) {
                    await this.page.locator(sourceMenuSelector).first().click();
                    await this.page
                        .locator(slct(DatasetSourcesTableQa.SourceContextMenuDelete))
                        .first()
                        .click();
                    await waitForBiValidateDatasetResponses(this.page, 5000);
                }

                const contextMenu = await this.page.waitForSelector(
                    slct(DatasetSourcesLeftPanelQA.ConnContextMenuBtn),
                );
                await contextMenu.click();
                const deleteBtn = await this.page.waitForSelector(
                    slct(DatasetSourcesLeftPanelQA.ConnContextMenuDelete),
                );
                await deleteBtn.click();
                const connSelectionButton = await this.page.waitForSelector(
                    slct(DatasetSourcesLeftPanelQA.ConnSelection),
                );
                await connSelectionButton.click();
                break;
            }
        }

        await this.page.waitForSelector(slct(DialogCollectionStructureQa.ListItem));

        const sharedConn = this.page
            .locator(slct(DialogCollectionStructureQa.ListItem))
            .filter({hasText: connectionName});
        await sharedConn.click();
    }

    async checkIsReadonlyState() {
        await this.page.waitForSelector(slct(SharedEntriesBaseQa.OpenOriginalBtn));
    }
}

export default DatasetPage;
