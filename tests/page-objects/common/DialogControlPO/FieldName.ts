import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {TextInputElementPO} from '../abstract/TextInputElementPO';

export class FieldName extends TextInputElementPO {
    constructor(page: Page) {
        super({page, selectors: {qa: {root: slct(DialogControlQa.fieldNameInput)}}});
    }
}
