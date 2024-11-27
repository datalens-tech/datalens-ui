import {CollectionContentTableQa, CollectionsPageQa} from '../../../src/shared';
import {BasePage} from '../BasePage';
import type {BasePageProps} from '../BasePage';
import {slct} from '../../utils';
import {ContentTableRow} from './ContentTableRow';

type CollectionsPageProps = BasePageProps;

export class CollectionsPage extends BasePage {
    private readonly root = slct(CollectionsPageQa.PageContainer);

    private readonly collectionRow: ContentTableRow;
    private readonly workbookRow: ContentTableRow;

    constructor({page}: CollectionsPageProps) {
        super({page});

        this.collectionRow = new ContentTableRow({
            page,
            selectors: {
                parent: this.root,
                root: slct(CollectionContentTableQa.CollectionLinkRow),
            },
        });
        this.workbookRow = new ContentTableRow({
            page,
            selectors: {
                parent: this.root,
                root: slct(CollectionContentTableQa.WorkbookLinkRow),
            },
        });
    }

    async clickCollectionRowLink() {
        await this.collectionRow.clickRowLink();
    }

    async clickWorkbookRowLink() {
        await this.workbookRow.clickRowLink();
    }
}
