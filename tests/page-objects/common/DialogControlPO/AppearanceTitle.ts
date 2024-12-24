import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {ControlQA, DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {ElementPO} from '../abstract/ElementPO';
import {TextInputElementPO} from '../abstract/TextInputElementPO';
import {RadioGroupElementPO} from '../abstract/RadioGroupElementPO';

export class AppearanceTitle extends ElementPO {
    textInput: TextInputElementPO;
    radioGroup: RadioGroupElementPO;

    constructor(page: Page) {
        super({page, selectors: {root: slct(DialogControlQa.appearanceTitle)}});
        this.textInput = new TextInputElementPO({
            page,
            selectors: {root: slct(ControlQA.inputNameControl)},
        });
        this.radioGroup = new RadioGroupElementPO({
            page,
            selectors: {root: slct(DialogControlQa.appearanceTitlePlacement)},
        });
    }
}
