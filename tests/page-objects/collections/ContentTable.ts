import {Page} from '@playwright/test';
import {CollectionContentTableQa} from '../../../src/shared';
import {slct} from '../../utils';
import {ElementPO} from '../common/abstract/ElementPO';
import {ContentTableRowPO} from './ContentTableRow';

type ContentTableProps = {
    page: Page;
    parent: string;
};

export class ContentTablePO extends ElementPO {
    constructor({page, parent}: ContentTableProps) {
        super({
            page,
            selectors: {
                root: slct(CollectionContentTableQa.Table),
                parent,
            },
        });
    }

    get collectionRow() {
        return new ContentTableRowPO({
            page: this.page,
            selectors: {
                parent: this.getSelector(),
                root: slct(CollectionContentTableQa.CollectionLinkRow),
            },
        });
    }

    get workbookRow() {
        return new ContentTableRowPO({
            page: this.page,
            selectors: {
                parent: this.getSelector(),
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
