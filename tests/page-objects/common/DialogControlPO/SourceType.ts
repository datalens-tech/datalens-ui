import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {RadioGroupElementPO} from '../abstract/RadioGroupElementPO';

export class SourceType extends RadioGroupElementPO {
    constructor(page: Page) {
        super({
            page,
            selectors: {
                root: slct(DialogControlQa.radioSourceType),
            },
        });
    }
}
