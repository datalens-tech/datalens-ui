import {Page} from '@playwright/test';
import {WorkbookPageQa} from '../../../src/shared/constants/qa/workbooks';
import {slct} from '../../utils';
import {ElementPO} from '../common/abstract/ElementPO';

type FiltersProps = {
    page: Page;
    parent: string;
};

export class FiltersPO extends ElementPO {
    constructor({page, parent}: FiltersProps) {
        super({
            page,
            selectors: {
                root: slct(WorkbookPageQa.Filters),
                parent,
            },
        });
    }
}
