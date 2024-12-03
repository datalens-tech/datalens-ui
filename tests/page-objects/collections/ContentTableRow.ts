import {CollectionContentTableQa} from '../../../src/shared';
import {ElementPO} from '../common/abstract/ElementPO';
import type {ElementPOProps} from '../common/abstract/types';
import {slct} from '../../utils';

type ContentTableRowProps = ElementPOProps;

export class ContentTableRowPO extends ElementPO {
    constructor({page, selectors}: ContentTableRowProps) {
        super({page, selectors});
    }

    get rowTitleCell() {
        return new ElementPO({
            page: this.page,
            selectors: {
                parent: this.getSelector(),
                root: slct(CollectionContentTableQa.CollectionTitleCell),
            },
        });
    }

    async clickRowLink() {
        await this.rowTitleCell.click();
    }
}
