import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {
    DatasetSourcesTableQa,
    DatasetFieldsTabQa,
    ParametersQA,
    FiltersQA,
    RelationsMapQA,
} from '../../../../src/shared';
import {DatasetsEntities} from '../../../constants/test-entities/datasets';
import {RobotChartsDatasetUrls} from '../../../utils/constants';

datalensTest.describe('Dataset basic ui', () => {
    const url = `datasets${DatasetsEntities.Basic.url}`;
    datalensTest('Sources tab should be open with query', async ({page}) => {
        await openTestPage(page, url, {tab: 'sources'});
        const selection = slct(DatasetSourcesTableQa.Source);
        await page.waitForSelector(selection);
        const source = page.locator(selection).first();
        await expect(source).toBeVisible();
    });

    datalensTest('Dataset tab should be open with query', async ({page}) => {
        await openTestPage(page, url, {tab: 'dataset'});
        const selection = slct(DatasetFieldsTabQa.FieldNameColumnInput);
        await page.waitForSelector(selection);
        const fieldInput = page.locator(selection).first();
        await expect(fieldInput).toBeVisible();
    });

    datalensTest('Parameters tab should be open with query', async ({page}) => {
        await openTestPage(page, url, {tab: 'parameters'});
        const selection = slct(ParametersQA.ParametersTabSection);
        await page.waitForSelector(selection);
        const parametersTab = page.locator(selection);
        await expect(parametersTab).toBeVisible();
    });

    datalensTest('Filters tab should be open with query', async ({page}) => {
        await openTestPage(page, url, {tab: 'filters'});
        const selection = slct(FiltersQA.FiltersTabSection);
        await page.waitForSelector(selection);
        const filtersTab = page.locator(selection);
        await expect(filtersTab).toBeVisible();
    });

    datalensTest('Dataset tab should be open with wrong query', async ({page}) => {
        await openTestPage(page, url, {tab: 'foobar'});
        const selection = slct(DatasetFieldsTabQa.DatasetEditor);
        await page.waitForSelector(selection);
        const relationsMap = page.locator(selection);
        await expect(relationsMap).toBeVisible();
    });

    datalensTest('Sources tab should be open in new dataset', async ({page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.NewDataset);
        const selection = slct(RelationsMapQA.RelationsMap);
        await page.waitForSelector(selection);
        const relationsMap = page.locator(selection);
        await expect(relationsMap).toBeVisible();
    });
});
