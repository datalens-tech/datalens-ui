import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {CheckboxElementPO} from '../abstract/CheckboxElementPO';

export class RequiredCheckbox extends CheckboxElementPO {
    constructor(page: Page) {
        super({page, selectors: {root: slct(DialogControlQa.requiredValueCheckbox)}});
    }
}
