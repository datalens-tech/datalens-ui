import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {NavigationMinimalPopup} from '../../../page-objects/workbook/NavigationMinimalPopup';
import {ElementPO} from '../abstract/ElementPO';

export class SelectDatasetButton extends ElementPO {
    navigationMinimal: NavigationMinimalPopup;

    constructor(page: Page) {
        super({
            page,
            selectors: {
                qa: {
                    root: slct(DialogControlQa.selectDatasetButton),
                },
            },
        });

        this.navigationMinimal = new NavigationMinimalPopup(page);
    }
}
