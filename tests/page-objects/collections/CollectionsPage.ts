import {CollectionActionsQa, EntryScope} from '../../../src/shared';
import type {BasePageProps} from '../BasePage';
import {BasePage} from '../BasePage';
import {ContentTablePO} from './ContentTable';
import {EmptyStatePO} from './EmptyState';
import {slct} from '../../utils';

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
        const sharedObjectsMenuItem = this.page.locator(
            slct(CollectionActionsQa.SharedObjectsMenuItem),
        );
        await sharedObjectsMenuItem.hover();

        switch (scope) {
            case EntryScope.Connection: {
                const sharedConnectionCreateBtn = this.page.locator(
                    slct(CollectionActionsQa.SharedConnectionCreateBtn),
                );
                await sharedConnectionCreateBtn.click();
                break;
            }
            case EntryScope.Dataset: {
                const sharedDatasetCreateBtn = this.page.locator(
                    slct(CollectionActionsQa.SharedDatasetCreateBtn),
                );
                await sharedDatasetCreateBtn.click();
                break;
            }
        }
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
}
