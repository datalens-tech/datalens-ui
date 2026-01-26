import {v1 as uuidv1} from 'uuid';
import {
    DialogCreateWorkbookEntryQa,
    EntryDialogQA,
} from '../../../src/shared/constants/qa/components';
import {
    DatasetPanelQA,
    DatasetActionQA,
    DatasetSourcesTableQa,
} from '../../../src/shared/constants/qa/datasets';

import {deleteEntity, slct} from '../../utils';
import {BasePage, BasePageProps} from '../BasePage';
import DialogParameter from '../common/DialogParameter';

import DatasetTabSection from './DatasetTabSection';
import {CollectionIds} from '../../constants/constants';
import {SharedEntriesPermissionsDialogQa} from '../../../src/shared';

export interface DatasetPageProps extends BasePageProps {}

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
        isSharedDataset = false,
    }: {name?: string; isSharedDataset?: boolean} = {}) {
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
            if (isSharedDataset) {
                await this.page.waitForURL(() => {
                    return this.page.url().endsWith(CollectionIds.E2ESharedEntriesCollection);
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

    async setDelegationAndSaveSharedDataset(
        {name, delegation}: {name?: string; delegation?: boolean} = {delegation: true},
    ) {
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

        await this.page.waitForSelector(slct(DatasetSourcesTableQa.Source));

        await this.addAvatarByDragAndDrop();

        const dsName = await this.createDatasetInWorkbookOrCollection({
            isSharedDataset: true,
            name,
        });

        return dsName;
    }
}

export default DatasetPage;
