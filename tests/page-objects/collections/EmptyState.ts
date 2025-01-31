import {Page} from '@playwright/test';
import {ElementPO} from '../common/abstract/ElementPO';

type EmptyStateProps = {
    page: Page;
    parent: string;
};

export class EmptyStatePO extends ElementPO {
    constructor({page, parent}: EmptyStateProps) {
        super({
            page,
            selectors: {
                root: '.dl-collection-content__empty-state',
                parent,
            },
        });
    }
}
