import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {SelectElementPO} from '../abstract/SelectElementPO';

export class DatasetFieldSelector extends SelectElementPO {
    constructor(page: Page) {
        super({
            page,
            selectors: {
                qa: {
                    root: slct(DialogControlQa.fieldSelect),
                },
            },
        });
    }
}
