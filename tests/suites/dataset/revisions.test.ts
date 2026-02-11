import {expect} from '@playwright/test';

import datalensTest from '../../utils/playwright/globalTestDefinition';
import DatasetPage from '../../page-objects/dataset/DatasetPage';
import {openTestPage, slct} from '../../utils';
import {COMMON_SELECTORS} from '../../utils/constants';
import {AvatarQA, DatasetSourcesTableQa, DatasetFieldsTabQa} from '../../../src/shared';

const datasetUrl = '/gateway/root/bi/getSources';
const revisionsUrl = '/gateway/root/us/getRevisions';
const dsNamePattern = 'e2e-ds-rev-test';

const TEST_CONNECTION_ID = '7abw3lfp9e6ex';
const DEFAULT_YT_DATASETS_PATH = 'Users/robot-charts/E2E_TMP_DS/';

const getName = () => {
    return `${dsNamePattern}-${Date.now()}`;
};

datalensTest.describe('Dataset revision interactions', () => {
    datalensTest.beforeEach(async ({page}) => {
        const datasetPage = new DatasetPage({page});
        const url = `datasets/new?id=${TEST_CONNECTION_ID}&currentPath=${DEFAULT_YT_DATASETS_PATH}`;

        await openTestPage(page, url);

        // Wait for source to load and add avatar
        await datasetPage.waitForSelector(slct(DatasetSourcesTableQa.Source));
        await datasetPage.addAvatarByDragAndDrop();
        await datasetPage.waitForSelector(slct(AvatarQA.Avatar));

        // Create dataset in folder
        await datasetPage.createDatasetInFolder({name: getName()});
    });

    datalensTest.afterEach(async ({page}) => {
        await page.reload();
        const pageUrl = page.url();

        if (pageUrl.includes(dsNamePattern)) {
            const datasetPage = new DatasetPage({page});
            await datasetPage.deleteEntry();
        }
    });

    datalensTest('Revision should be shown in supported dataset', async ({page}) => {
        const datasetPage = new DatasetPage({page});

        await datasetPage.revisions.openList();

        const items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
        // check that the dataset was created with one revision
        expect(items).toHaveLength(1);
    });

    datalensTest('Revision should be update after set to actual revision', async ({page}) => {
        const datasetPage = new DatasetPage({page});

        // Wait for dataset fields to load
        await datasetPage.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        const {originalValue} = await datasetPage.renameFirstField();
        await datasetPage.saveUpdatedDataset();
        await datasetPage.revisions.openList();

        const items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
        // check that the dataset now has two revisions
        expect(items).toHaveLength(2);

        // change revision to previous
        const getDatasetSuccessfulPromise = datasetPage.waitForSuccessfulResponse(datasetUrl);
        await items[items.length - 1].click();
        await getDatasetSuccessfulPromise;

        await datasetPage.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        const restoredFieldInput = page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .first();
        const restoredValue = await restoredFieldInput.locator('input').inputValue();

        // value must be equal to initial value
        expect(restoredValue).toBe(originalValue);

        // make old revision actual
        await datasetPage.revisions.makeRevisionActual();
        await datasetPage.revisions.waitUntilRevisionPanelDisappear();

        await datasetPage.revisions.validateRevisions(3);

        const revId = await datasetPage.revisions.getRevisionIdFromUrl();

        expect(revId).toBe(null);
        expect(restoredValue).toBe(originalValue);
    });

    datalensTest('Revision should be update after save not actual revision', async ({page}) => {
        const datasetPage = new DatasetPage({page});

        await datasetPage.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        const {originalValue} = await datasetPage.renameFirstField();
        await datasetPage.saveUpdatedDataset();

        await datasetPage.revisions.openList();

        let items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
        // check that the dataset now has two revisions
        expect(items).toHaveLength(2);

        // change revision to previous
        let getDatasetSuccessfulPromise = datasetPage.waitForSuccessfulResponse(datasetUrl);
        await items[items.length - 1].click();
        await getDatasetSuccessfulPromise;

        await datasetPage.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        await datasetPage.renameFirstField({value: `${originalValue}_third`});

        getDatasetSuccessfulPromise = datasetPage.waitForSuccessfulResponse(revisionsUrl);
        await datasetPage.saveUpdatedDataset();
        await getDatasetSuccessfulPromise;

        items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
        expect(items).toHaveLength(3);
    });
});
