import {
    CollectionActionsQa,
    CollectionContentTableQa,
    CollectionTableRowQa,
    EntryScope,
    SharedEntriesBindingsDialogQa,
} from '../../../src/shared';
import type {BasePageProps} from '../BasePage';
import {BasePage} from '../BasePage';
import {ContentTablePO} from './ContentTable';
import {EmptyStatePO} from './EmptyState';
import {createSharedEntry, slct} from '../../utils';
import {v1 as uuidv1} from 'uuid';
import {DialogWorkbook} from '../workbook/DialogWorkbook';

type CollectionsPageProps = BasePageProps;

export class CollectionsPagePO extends BasePage {
    private readonly root = '.dl-collections-navigation-layout';

    constructor({page}: CollectionsPageProps) {
        super({page});
    }

    async createSharedEntry({scope}: {scope: EntryScope.Dataset | EntryScope.Connection}) {
        const createBtn = await this.page.waitForSelector(
            slct(CollectionActionsQa.CreateActionBtn),
        );
        await createBtn.click();
        await createSharedEntry({page: this.page, scope});
    }

    async createWorkbook({name = uuidv1()}: {name?: string} = {}) {
        const createBtn = await this.page.waitForSelector(
            slct(CollectionActionsQa.CreateActionBtn),
        );
        await createBtn.click();
        const createWbBtn = await this.page.waitForSelector(
            slct(CollectionActionsQa.CreateWorkbookMenuItem),
        );
        await createWbBtn.click();
        const dialogWb = new DialogWorkbook(this.page);
        await dialogWb.fillTitle(name);
        await dialogWb.apply();
        await this.page.waitForURL(() => {
            return this.page.url().includes('workbook');
        });
        return name;
    }

    get emptyState() {
        return new EmptyStatePO({
            page: this.page,
            parent: this.root,
        });
    }

    get contentTable() {
        return new ContentTablePO({
            page: this.page,
            parent: this.root,
        });
    }

    async removeSharedEntry({entryName}: {entryName: string}) {
        const entryRow = this.page.locator(slct(CollectionContentTableQa.EntryLinkRow), {
            hasText: entryName,
        });
        const entryContextMenuBtn = entryRow.locator(
            slct(CollectionTableRowQa.CollectionRowDropdownMenuBtn),
        );
        await entryContextMenuBtn.click();
        await this.page.locator(slct(CollectionTableRowQa.CollectionDropdownMenuDeleteBtn)).click();
        const dialogApply = this.page.locator(slct(SharedEntriesBindingsDialogQa.ApplyDeleteBtn));
        await dialogApply.click();
    }
}
