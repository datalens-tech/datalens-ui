import {Page} from '@playwright/test';

import DatasetPage from '../../page-objects/dataset/DatasetPage';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {DATASET_TAB, DatasetActionQA, DatasetDialogRelationQA} from '../../../src/shared';
import {openTestPage, slct} from '../../utils';
import {RobotChartsDatasetUrls} from '../../utils/constants';

const SELECTORS = {
    TOAST_VALIDATION_ERROR: '.g-toaster .g-toast__icon_danger',
    RELATION_JOIN_ICON: 'g.relations-map__join.relations-map__join_error',
    RELATION_DIALOG_TITLE: slct(DatasetDialogRelationQA.DialogTitle),
    RELATION_CONDITION_LIST_ITEM: '.relation-dialog .relation-dialog__join-condition',
    ADD_RELATION_BUTTON: slct(DatasetDialogRelationQA.AddRelation),
    SELECT_CONTROL: '.g-select',
    SELECT_CONTROL_ITEM: '.g-list__items .g-select-list__item',
    RELATION_APPLY_BUTTON: slct(DatasetDialogRelationQA.Apply),
    SAVE_DATASET_ACTIVE_BUTTON: slct(DatasetActionQA.CreateButton),
};

datalensTest.describe('Datasets - validation error does not break the communication dialog', () => {
    datalensTest(
        'In case of a dataset validation error, the button for adding links in sources remains active',
        async ({page}: {page: Page}) => {
            const datasetPage = new DatasetPage({page});
            await openTestPage(page, RobotChartsDatasetUrls.DatasetWithValidationError);

            await datasetPage.openTab(DATASET_TAB.SOURCES);

            // waiting for the validation error to appear
            await datasetPage.waitForSelector(SELECTORS.TOAST_VALIDATION_ERROR);

            // looking for an icon of an erroneous connection to click
            const relationJoinIcon = await datasetPage.waitForSelector(
                SELECTORS.RELATION_JOIN_ICON,
            );
            relationJoinIcon.dispatchEvent('click');

            // we are waiting for the appearance of a communication dialog
            await datasetPage.waitForSelector(SELECTORS.RELATION_DIALOG_TITLE);

            // check the absence of binding fields
            let relationItems = await page.$$(SELECTORS.RELATION_CONDITION_LIST_ITEM);
            expect(relationItems.length === 0).toEqual(true);

            // adding a link and waiting for the addition of an element of linking fields
            await page.click(SELECTORS.ADD_RELATION_BUTTON);
            relationItems = await page.$$(SELECTORS.RELATION_CONDITION_LIST_ITEM);
            expect(relationItems.length === 1).toEqual(true);

            // find two selectors to specify the communication fields (0 - left field, 1 - right field)
            const relationItem = relationItems.pop();
            const relSelectControls = await relationItem?.$$(SELECTORS.SELECT_CONTROL);
            expect(relSelectControls?.length === 3).toEqual(true);

            // select any fields for communication selectors
            await relSelectControls?.[0].click();
            const selectorLeftItems = await page.$$(SELECTORS.SELECT_CONTROL_ITEM);
            await selectorLeftItems.shift()?.click();
            await relSelectControls?.[2].click();
            const selectorRightItems = await page.$$(SELECTORS.SELECT_CONTROL_ITEM);
            await selectorRightItems.shift()?.click();

            // apply the changes for communication and check that the save dataset button remains active
            await page.click(SELECTORS.RELATION_APPLY_BUTTON);
            await datasetPage.waitForSelector(SELECTORS.SAVE_DATASET_ACTIVE_BUTTON);
        },
    );
});
