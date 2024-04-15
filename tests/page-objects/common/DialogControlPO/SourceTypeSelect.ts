import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {SelectElementPO} from '../abstract/SelectElementPO';

export class SourceTypeSelect extends SelectElementPO {
    constructor(page: Page) {
        super({
            page,
            selectors: {
                root: slct(DialogControlQa.seletSourceType),
            },
        });
    }
}
