import {CollectionContentTableQa} from '../../../src/shared';
import {ElementPO} from '../common/abstract/ElementPO';
import type {ElementPOProps} from '../common/abstract/types';
import {slct} from '../../utils';

type ContentTableRowProps = ElementPOProps;

export class ContentTableRow extends ElementPO {
    private readonly rowTitleCell: ElementPO;

    constructor({page, selectors}: ContentTableRowProps) {
        super({page, selectors});

        this.rowTitleCell = new ElementPO({
            page,
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
