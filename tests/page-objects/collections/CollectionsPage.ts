import {BasePage} from '../BasePage';
import type {BasePageProps} from '../BasePage';
import {ContentTablePO} from './ContentTable';
import {EmptyStatePO} from './EmptyState';

type CollectionsPageProps = BasePageProps;

export class CollectionsPagePO extends BasePage {
    private readonly root = '.dl-collections-navigation-layout';

    constructor({page}: CollectionsPageProps) {
        super({page});
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
