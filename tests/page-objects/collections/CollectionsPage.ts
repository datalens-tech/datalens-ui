import {
    CollectionActionsQa,
    CollectionContentTableQa,
    CollectionFiltersQa,
    CollectionItemEntities,
    CollectionTableRowQa,
    DialogConfirmQA,
    EntryScope,
    SharedEntriesBindingsDialogQa,
    ValueOf,
} from '../../../src/shared';
import type {BasePageProps} from '../BasePage';
import {BasePage} from '../BasePage';
import {ContentTablePO} from './ContentTable';
import {EmptyStatePO} from './EmptyState';
import {createSharedEntry, slct} from '../../utils';
import {v1 as uuidv1} from 'uuid';
import {DialogWorkbook} from '../workbook/DialogWorkbook';

type CollectionsPageProps = BasePageProps;
type FindEntityProps = {
    entityName: string;
    type: ValueOf<typeof CollectionItemEntities>;
};

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

    async removeEntity({entityName, type}: FindEntityProps) {
        const entityRow = await this.findEntity({entityName, type});
        const entityContextMenuBtn = entityRow.locator(
            slct(CollectionTableRowQa.CollectionRowDropdownMenuBtn),
        );
        await entityContextMenuBtn.click();
        await this.page.locator(slct(CollectionTableRowQa.CollectionDropdownMenuDeleteBtn)).click();
        if (type === CollectionItemEntities.ENTRY) {
            const dialogApply = this.page.locator(
                slct(SharedEntriesBindingsDialogQa.ApplyDeleteBtn),
            );
            await dialogApply.click();
        } else {
            const dialogApply = this.page.locator(slct(DialogConfirmQA.ApplyButton));
            await dialogApply.click();
        }
    }

    async findEntity({entityName, type}: FindEntityProps) {
        await this.page.waitForSelector(slct(CollectionFiltersQa.SearchInput));
        const search = this.page.locator(slct(CollectionFiltersQa.SearchInput)).locator('input');
        await search.press('Meta+A');
        await search.press('Backspace');
        await search.fill(entityName);

        await this.waitForSuccessfulResponse('/getStructureItems');

        let entitySelector: string;

        switch (type) {
            case CollectionItemEntities.COLLECTION:
                entitySelector = CollectionContentTableQa.CollectionLinkRow;
                break;
            case CollectionItemEntities.WORKBOOK:
                entitySelector = CollectionContentTableQa.WorkbookLinkRow;
                break;
            case CollectionItemEntities.ENTRY:
                entitySelector = CollectionContentTableQa.EntryLinkRow;
        }

        await this.page.waitForSelector(slct(entitySelector));
        const currentEntry = this.page.locator(slct(entitySelector), {
            hasText: entityName,
        });
        return currentEntry;
    }
}
